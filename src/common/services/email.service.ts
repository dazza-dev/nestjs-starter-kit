import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { emailConfig } from '@/config/EmailConfig';
import { I18nService } from 'nestjs-i18n';
import { EmailTemplateHelper } from '@/common/emails/email-template.helper';
import type {
  SendEmailOptions,
  EmailResponse,
} from '@/common/types/email.type';

interface NodemailerResponse {
  accepted: string[];
  rejected: string[];
  messageId: string;
}

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(emailConfig.KEY)
    private config: ConfigType<typeof emailConfig>,
    private readonly i18n: I18nService,
  ) {
    const transportConfig: SMTPTransport.Options = {
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
    };

    if (this.config.auth.user && this.config.auth.pass) {
      transportConfig.auth = {
        user: this.config.auth.user,
        pass: this.config.auth.pass,
      };
    }

    this.transporter = nodemailer.createTransport(transportConfig);
  }

  /**
   * Sends an email.
   */
  async send(options: SendEmailOptions): Promise<EmailResponse> {
    try {
      const mailOptions = {
        from: `${this.config.from.name} <${this.config.from.address}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo,
        attachments: options.attachments,
      };

      const info = (await this.transporter.sendMail(
        mailOptions,
      )) as NodemailerResponse;

      this.logger.log(`Email sent successfully: ${info.messageId}`);

      return {
        accepted: info.accepted,
        rejected: info.rejected,
        messageId: info.messageId,
      };
    } catch (error) {
      this.logger.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Sends the password reset link, pointing to the SPA screen that completes it.
   */
  async sendPasswordReset(
    email: string,
    token: string,
    minutes: number,
  ): Promise<void> {
    const base = (process.env.FRONTEND_URL ?? 'http://localhost:5173').replace(
      /\/$/,
      '',
    );
    const url = `${base}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    const t = (key: string, args?: Record<string, unknown>): string =>
      this.i18n.t(`auth.${key}`, args ? { args } : undefined);

    const html = await EmailTemplateHelper.generateEmail({
      title: t('reset_subject'),
      greeting: t('reset_greeting'),
      introLines: [t('reset_intro')],
      action: { text: t('reset_action'), url },
      outroLines: [t('reset_expire', { minutes }), t('reset_outro')],
      salutation: t('reset_salutation'),
      subcopy: this.i18n.t('email.subcopy'),
      rights: this.i18n.t('email.rights'),
    });

    await this.send({
      to: email,
      subject: t('reset_subject'),
      text: [
        t('reset_greeting'),
        t('reset_intro'),
        url,
        t('reset_expire', { minutes }),
        t('reset_outro'),
        t('reset_salutation'),
      ].join('\n\n'),
      html,
    });
  }

  /**
   * Verifies the SMTP connection configuration.
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      this.logger.error('SMTP connection verification failed:', error);
      return false;
    }
  }
}
