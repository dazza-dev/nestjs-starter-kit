# nestjs-starter-kit

A NestJS API to start a project without rebuilding login, roles, permissions and module structure
from scratch.

NestJS 11 · Prisma 7 · MySQL · JWT in a cookie

Consumed by [`vue-starter-kit`](https://github.com/dazza-dev/vue-starter-kit) and
[`react-starter-kit`](https://github.com/dazza-dev/react-starter-kit).

---

## What it includes

- Custom JWT authentication in an httpOnly cookie: login, password recovery, logout and profile
- Permission-based authorization with global guards and an `admin` role bypass
- Modular architecture: each feature is a self-contained module with its own controllers, services, DTOs, resources and types
- Full CRUD for users, roles, permissions, groups and settings
- Translations in `en`, `es` and `pt` resolved via `Accept-Language`
- Queues with Redis and nestjs-sentinel, with supervisors split by job type
- Prisma as ORM, with schema and seeders included

## Requirements

- Node.js 22+
- pnpm
- MySQL 8+
- Redis

## Getting started

```bash
pnpm install
cp .env.example .env

mysql -uroot -p -e "CREATE DATABASE nestjs_starter"
npx prisma migrate dev
npx tsx src/prisma/seeders/DatabaseSeeder.ts

pnpm start:dev        # http://localhost:3000
pnpm worker           # processes the queues; panel at /sentinel
```

The seeder creates the user you sign in with the first time: `admin@example.test` / `password123`.
The credentials are at the top of `src/prisma/seeders/DatabaseSeeder.ts`; change them there before
seeding a real environment.

Quick check:

```bash
curl http://localhost:3000/api/v1/settings
```

## Requests and responses

Every module hangs off `api/v1/`, Auth included.

The API speaks `snake_case` while the code works in `camelCase`: `SnakeCaseInterceptor` converts
outgoing responses and `CamelCaseMiddleware` converts incoming ones. On the SPA side,
`axios-case-converter` does the same on the other end.

Listings return `data`, `links` and `meta` (`current_page`, `per_page`, `total`...), which is what
the frontend table expects; `prismaPaginate` emits it. A single item goes in `{ data, message }`,
and an action with no payload in `{ message }`.

The session is a JWT signed inside an httpOnly cookie. It's transparent to the frontend, which
never reads its contents.

## Structure

```
src/
├── common/
│   ├── decorators/     CurrentUser, RequirePermissions
│   ├── filters/        Errors and validation shaped like the API
│   ├── guards/         PermissionsGuard (includes the admin bypass)
│   ├── helpers/        Case conversion, formatting, dates
│   ├── interceptors/   SnakeCaseInterceptor
│   ├── middleware/     CamelCaseMiddleware
│   └── services/       EmailService
├── config/             AppConfig, AuthConfig, CorsConfig, EmailConfig, DatabaseConfig, QueueConfig, ThrottleConfig
├── i18n/{en,es,pt}/    Translations per module
├── modules/
│   ├── auth/           Login, password recovery, profile
│   ├── files/          Serves the private disk through an endpoint
│   ├── users/          User CRUD  ← full example
│   └── configs/        Roles, groups, permissions and settings
├── queue/              Processors and a dispatch example
├── prisma/
│   ├── schema/         Schema split by domain
│   ├── seeders/        Seeders
│   ├── data/           Seed data, in JSON
│   └── generated/      Prisma client
└── worker.ts           Process that consumes the queues
```

Development rules and the module pattern live in [`CLAUDE.md`](./CLAUDE.md).

## Adding a module

1. Copy `src/modules/configs` and keep a single controller, service, resource and DTO
2. Add its model in `src/prisma/schema/` and run `npx prisma migrate dev`
3. Register the module in `src/app.module.ts`
4. Declare its permissions in `src/prisma/data/Permissions.json` and translate them in `src/i18n/*/permissions.json`

## Storage

With `StorageService` the code asks for a disk and doesn't know whether it writes to local disk or
S3. There are two disks, and the difference is who can read what you store.

| Disk     | Written to       | Served by                            | For                       |
| -------- | ---------------- | ------------------------------------ | ------------------------- |
| `public` | `storage/public` | static under `/storage/...`          | Logos and branding assets |
| `local`  | `storage`        | `GET api/v1/files/...`, with session | User uploads              |

```ts
// Public: the path is not secret.
const logo = await this.storage.put('logos', file, 'public');
this.storage.url(logo, 'public'); // http://localhost:3000/storage/logos/xxx.png

// Private: only reachable through the endpoint, with a session.
const doc = await this.storage.put('docs', file, 'local');
this.storage.url(doc, 'local'); // http://localhost:3000/api/v1/files/docs/xxx.pdf
```

`url()` checks whether the disk has its own URL: if it does, it returns the direct path; if not, the
endpoint's. That way the code that saves a file never decides how it's served — the disk does.

`FilesController` reads from the private disk and streams the file back, so the URL says nothing
about where it lives or whether the disk is local or a bucket, and switching driver doesn't
invalidate stored URLs. It requires a session; per-file authorization (who owns it, who can view it)
is up to each project.

Each disk's driver is configured in `FileSystemConfig`. `local` works with no extra install; `s3`
loads the SDK only when used, so it requires `pnpm add @aws-sdk/client-s3`.

## Queues and scheduled tasks

Queues run on Redis, managed by [`nestjs-sentinel`](https://github.com/dazza-dev/nestjs-sentinel).
**Redis is required**: the app won't start without it.

```bash
pnpm worker                             # processes the queues; panel at /sentinel
npx tsx src/queue/example.dispatch.ts   # queues an example job
```

The config lives in `src/config/QueueConfig.ts` and the example processor in
`src/queue/processors/`. The panel is protected with basic auth (`SENTINEL_USER` and
`SENTINEL_PASSWORD`); if either is empty it won't open, and it should be served **over HTTPS only**.

Supervisors, batches, tags and retries are covered in the
[nestjs-sentinel docs](https://github.com/dazza-dev/nestjs-sentinel).

`ScheduleModule` is registered with **no active task**, on purpose. Add yours as a provider with
`@Cron`.

## Emails

Emails are laid out with **MJML** in `EmailTemplateHelper`: a 570px card on `#fafafa`, `#18181b`
button, gray footer and system font stack. MJML generates its own table structure, built to hold up
in older email clients.

Composed in blocks:

```ts
EmailTemplateHelper.generateEmail({
  title,
  greeting,
  introLines,
  action: { text, url },
  outroLines,
  salutation,
  subcopy,
  rights,
});
```

Text lives in `src/i18n/{en,es,pt}/`: per-email strings in `auth.json` and the shared ones
(`subcopy`, `rights`) in `email.json`. Placeholders use the nestjs-i18n syntax, in braces
(`{minutes}`, `{actionText}`).

The password reset link points to `{FRONTEND_URL}/auth/reset-password`. Locally,
`brew install mailpit && brew services start mailpit` spins up an SMTP server on 1025 and an inbox at
`http://localhost:8025`, which is what `.env.example` points to.

## Before committing

```bash
pnpm lint
npx tsc --noEmit
pnpm test
```
