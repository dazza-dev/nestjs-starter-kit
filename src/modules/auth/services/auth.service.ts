import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@/prisma/prisma.service';
import { EmailService } from '@/common/services/email.service';
import type { AuthenticatedUser } from '@/modules/users/types/user.type';
import type { JwtPayload } from '@/modules/auth/types/auth.type';
import { ADMIN_ROLE } from '@/modules/configs/constants/acl.constants';

/** Minutes the reset link stays alive. */
const RESET_TOKEN_TTL_MINUTES = 60;

/** Seconds that must pass between two link requests for the same email. */
const RESET_THROTTLE_SECONDS = 60;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly i18n: I18nService,
    private readonly email: EmailService,
  ) {}

  /**
   * Validates the credentials and returns the user with their effective permissions.
   */
  async attemptLogin(
    username: string,
    password: string,
  ): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findFirst({
      where: { username, deletedAt: null },
      include: { roles: { include: { role: true } } },
    });

    if (!user?.password || !(await bcrypt.compare(password, user.password))) {
      throw new UnprocessableEntityException(this.i18n.t('auth.failed'));
    }

    if (user.status !== 'active') {
      throw new UnprocessableEntityException(this.i18n.t('auth.not_allowed'));
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.toAuthenticatedUser(user);
  }

  /**
   * Returns the authenticated user from the token's identifier.
   */
  async findByUuid(uuid: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findFirst({
      where: { uuid, deletedAt: null },
      include: { roles: { include: { role: true } } },
    });

    if (!user) {
      throw new UnauthorizedException(
        this.i18n.t('auth.token_invalid_or_expired'),
      );
    }

    return this.toAuthenticatedUser(user);
  }

  /**
   * Signs the JWT that travels in the session cookie.
   */
  signToken(user: AuthenticatedUser): string {
    const payload: JwtPayload = {
      sub: user.uuid,
      email: user.email,
      isAdmin: user.isAdmin,
      permissions: user.permissions,
    };

    return this.jwt.sign(payload);
  }

  /**
   * Sends the recovery link, returning `false` only if it arrives too soon.
   */
  async sendResetLink(email: string): Promise<boolean> {
    const existing = await this.prisma.passwordResetToken.findUnique({
      where: { email },
    });

    if (existing?.createdAt) {
      const elapsed = (Date.now() - existing.createdAt.getTime()) / 1000;

      if (elapsed < RESET_THROTTLE_SECONDS) {
        return false;
      }
    }

    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (!user) {
      return true;
    }

    const token = randomBytes(32).toString('hex');

    await this.prisma.passwordResetToken.upsert({
      where: { email },
      create: {
        email,
        token: await bcrypt.hash(token, 10),
        createdAt: new Date(),
      },
      update: { token: await bcrypt.hash(token, 10), createdAt: new Date() },
    });

    await this.email.sendPasswordReset(email, token, RESET_TOKEN_TTL_MINUTES);

    return true;
  }

  /**
   * Changes the password if the emailed token is still valid.
   */
  async resetPassword(
    email: string,
    token: string,
    password: string,
  ): Promise<void> {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { email },
    });

    if (!record?.createdAt || !(await bcrypt.compare(token, record.token))) {
      throw new UnprocessableEntityException(this.i18n.t('auth.reset_invalid'));
    }

    const expired =
      (Date.now() - record.createdAt.getTime()) / 60000 >
      RESET_TOKEN_TTL_MINUTES;

    if (expired) {
      throw new UnprocessableEntityException(this.i18n.t('auth.reset_invalid'));
    }

    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (!user) {
      throw new UnprocessableEntityException(this.i18n.t('auth.reset_invalid'));
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: await bcrypt.hash(password, 10),
          rememberToken: randomBytes(30).toString('hex'),
        },
      }),
      this.prisma.passwordResetToken.delete({ where: { email } }),
    ]);
  }

  /**
   * Effective permissions: those from their roles plus the ones granted directly.
   */
  async permissionsFor(userId: bigint, roleIds: bigint[]): Promise<string[]> {
    const rows = await this.prisma.permission.findMany({
      where: {
        OR: [
          { users: { some: { userId } } },
          roleIds.length
            ? { roles: { some: { roleId: { in: roleIds } } } }
            : { id: BigInt(-1) },
        ],
      },
      select: { name: true },
      orderBy: { name: 'asc' },
    });

    return rows.map((row) => row.name);
  }

  private async toAuthenticatedUser(user: {
    id: bigint;
    uuid: string;
    firstName: string;
    lastName: string | null;
    email: string;
    phone: string | null;
    username: string | null;
    avatar: string | null;
    roles: {
      role: { uuid: string; name: string; displayName: string | null };
    }[];
  }): Promise<AuthenticatedUser> {
    const roles = user.roles.map((entry) => ({
      uuid: entry.role.uuid,
      name: entry.role.displayName ?? entry.role.name,
      slug: entry.role.name,
    }));

    const isAdmin = roles.some((role) => role.slug === ADMIN_ROLE);
    const roleIds = await this.prisma.roleUser
      .findMany({ where: { userId: user.id }, select: { roleId: true } })
      .then((rows) => rows.map((row) => row.roleId));

    return {
      uuid: user.uuid,
      name: [user.firstName, user.lastName].filter(Boolean).join(' '),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      username: user.username,
      avatar: user.avatar,
      roles,
      isAdmin,
      permissions: await this.permissionsFor(user.id, roleIds),
    };
  }
}
