# NestJS Starter Kit — Development Rules

## Stack

- NestJS 11, TypeScript 5
- Prisma 7 as ORM (MySQL), schema split by domain under `src/prisma/schema/`
- `nestjs-i18n` for translations, `class-validator` for DTO validation
- JWT signed into an httpOnly cookie for the session
- `nestjs-pino` for logging, `@nestjs/throttler` for rate limiting

---

## Comments

- **Language:** every comment is written in **English**, same as the code itself.
- **Docblocks:** one sentence. Use the multi-line `/** ... */` form even for a single line.
- **Inline comments:** a single `//` line. If it needs two, half of it is redundant.
- Never explain why an alternative was discarded. That belongs in the commit message.

---

## Module Structure

What more than one module needs lives in `src/common/`, not in the module that happened to need it
first: `dto/`, `helpers/`, `filters/`, `guards/`, `interceptors/`. A module must never import from
another module's folder.

`common/dto/` holds the shape every paginated listing shares: `QueryListDto` (search, page, perPage,
sortBy, trashed) and the `SortCriterionDto` it nests. A module's query DTO **extends** it and adds
only its own filters — class-validator inherits the decorators, so the parent's fields keep
validating under `whitelist: true`:

```ts
export class QueryUsersDto extends QueryListDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() roleUuid?: string;
}
```

Every feature lives in `src/modules/{feature}/`:

```
src/modules/configs/
├── constants/      Fixed domain values
├── controllers/    One controller per resource
├── dto/            Input validated with class-validator
├── resources/      Shape of the response the API returns
├── services/       Logic and Prisma access
├── types/          Types shared within the module
└── configs.module.ts
```

Modules that ship with the starter:

| Module    | Contents                                     |
| --------- | -------------------------------------------- |
| `auth`    | Login, password recovery, logout, profile    |
| `files`   | Serves the private disk through an endpoint  |
| `users`   | **Reference CRUD** — application users       |
| `configs` | `roles`, `groups`, `permissions`, `settings` |

Register every new module in `src/app.module.ts`.

---

## The API contract

The SPA is written against this shape. Anything that changes it breaks the client, so keep these
rules:

- **Everything hangs off `api/v1`**, set once in `main.ts` with `setGlobalPrefix`
- **The wire format is `snake_case`.** Write the code in `camelCase`: `SnakeCaseInterceptor` converts
  outgoing responses and `CamelCaseMiddleware` converts incoming bodies and query strings. Never
  hand-write snake_case keys in a resource
- **Response envelope:** `{ data, message }` for a single item, `{ message }` for actions with no
  payload, and `data` + `links` + `meta` for listings — that is what `prismaPaginate` returns
- **Errors** carry only `message`, plus `errors` keyed by field on validation failures (422). A
  domain 422 thrown from a service can carry that map too: pass
  `{ message, errors }` to `UnprocessableEntityException` and the filter forwards it. The keys go out
  in snake_case, like every other response, and a nested DTO is flattened to a dotted path
  (`sort_by.0.order`)
- **Sorting** arrives as `sort_by[0][key]` + `sort_by[0][order]`. `key` is the **field name as
  the API returns it** (camelCase), never a raw Prisma field: it travels as a _value_, so
  `CamelCaseMiddleware` does not touch it. Resolve it with `resolveSort()` against the module's
  `SORTABLE` map — passing the raw key to `orderBy` lets the client name any column and makes Prisma
  throw. Only the first criterion is used; an unknown key falls back to the default order
- **Default sort order matters**: users by `firstName`, roles by `displayName`, groups by `name`,
  all ascending. The frontend does not send a sort on first load, so a different default reorders the
  table

---

## Controllers

- One controller per resource, thin: validate, call the service, wrap in a resource
- Declare the permission with `@RequirePermissions('read-users')`
- Mark public endpoints with `@Public()`; everything else requires a session
- Read the authenticated user with `@CurrentUser()`, never from the raw request

---

## Services

- Own the Prisma access and the business rules
- Throw `UnprocessableEntityException` for domain errors — a 422, like a validation failure
- Never build the response shape — that is the resource's job

---

## Resources

Static classes with `toObject` and `toCollection`. They decide what leaves the API:

- Never expose the internal `id`. `uuid` is the public identifier
- Never expose `password` or `remember_token`

---

## Permissions

- Permissions live in `permissions`, grouped by `group` and optionally by `module_id` (nullable: a
  permission with no module falls into the `general` tab of the matrix)
- `PermissionsGuard` resolves them from the JWT payload
- The `admin` role has a **full bypass**. It is not a role with every checkbox ticked — un-ticking one
  could otherwise lock everyone out of the permissions screen
- Adding a permission means editing `src/prisma/data/Permissions.json`, re-seeding and translating it
  in `src/i18n/{en,es,pt}/permissions.json` under `actions`

---

## Authentication

- The session is a JWT signed into the `AUTH_TOKEN` cookie, httpOnly and `secure` in production
- `AuthGuard` is global: it reads the cookie and populates `request.user`
- The reset token is stored hashed in `password_reset_tokens`, expires in 60 minutes and there is a
  60-second throttle between requests for the same email
- `forgot-password` answers the same whether or not the email exists — the endpoint must not reveal
  which accounts are registered

## Emails

Emails are built with **MJML** in `EmailTemplateHelper`. The design tokens are a 570px card on
`#fafafa`, `#18181b` button and heading, `#52525b` body, `#a1a1aa` footer and a system font stack.
A message is composed from `greeting`, `introLines`, `action`, `outroLines`, `salutation`, `subcopy`
and `rights`.

- The design tokens are the contract, not the markup — MJML emits its own table scaffolding, so keep
  the tokens in sync and let it generate the tags
- Placeholders use the nestjs-i18n syntax, in braces (`{minutes}`, `{actionText}`). Any other syntax
  is left untouched and renders literally in the email
- Per-email strings live in `src/i18n/{lang}/auth.json`; the ones shared by every email
  (`subcopy`, `rights`) in `email.json`
- Text nodes escape `&`, `<` and `>`; attributes also escape `"`. Escaping quotes in text too would
  show `&quot;` in the body

---

## Storage

Never touch `fs` directly. Go through `StorageService`, which resolves a disk from `FileSystemConfig`
and hides whether the file lands on local disk or S3. Two disks, split by who may read the file:

| Disk     | Written to       | Served by                            | For                    |
| -------- | ---------------- | ------------------------------------ | ---------------------- |
| `public` | `storage/public` | static under `/storage/...`          | Logos, branding assets |
| `local`  | `storage`        | `GET api/v1/files/...`, with session | User uploads           |

- `put(directory, file, disk)` stores it with a random name and returns the **relative path**, which
  is what goes in the database
- `url(path, disk)` returns the direct URL when the disk defines one, and the masked endpoint when it
  does not. Picking the disk is the only decision the calling code makes
- The S3 driver imports the AWS SDK lazily; a project on the local disk never pays for it

`FilesController` (`GET api/v1/files/{folder}/{filename}`) streams files off the **private** disk, so
the URL says nothing about where the file lives and switching driver does not invalidate stored URLs.

- It requires a session. Per-file authorization — who owns it, who may read it — is the app's job
- Never serve the public disk through it, and never put user uploads on the public disk
- Both path segments are checked against `^[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*$` before touching the
  disk. A segment starting with a dot or equal to `..` would escape the storage root
- `isPlainObject` in `case.helper.ts` only accepts literal objects on purpose — `SnakeCaseInterceptor`
  would otherwise take a `StreamableFile` apart key by key

## Queues and scheduled tasks

Queues run on Redis through [`nestjs-sentinel`](https://github.com/dazza-dev/nestjs-sentinel), our own
package, configured in `src/config/QueueConfig.ts`. Redis is **required**; the app does not boot
without it. The package's own docs cover supervisors, batches and tags — what matters here is how
this repo wires it:

- The API only produces jobs: `app.module.ts` registers `SentinelModule` with `worker: false`.
  The processors live in `ProcessorsModule`, which only `src/worker.ts` loads (`pnpm worker`)
- **Run the worker through the Nest compiler, never through `tsx`.** esbuild does not emit
  `emitDecoratorMetadata`, so Nest sees a constructor with no parameters and injects nothing — the
  processor then fails at runtime, not at startup
- Use `forRootAsync` when the config reads `process.env`: `forRoot` evaluates its argument at import
  time, before `ConfigModule` loads the `.env`, and the workers end up on the wrong Redis database
- The panel is mounted with `setupSentinelBoard(app)` and stays outside the global prefix, since it
  is not part of the API. `basicAuth()` closes it when either credential is missing
  (`SENTINEL_USER`, `SENTINEL_PASSWORD`), and it must only be served over HTTPS

`ScheduleModule` is registered with **no active task** on purpose: the starter kit must not run
anything on its own.

---

## Translations

- **Three languages are mandatory: `en`, `es`, `pt`.** Every file must exist in all three with the
  same keys; a missing key silently falls back to `es`
- The frontend sends `Accept-Language`, which `AcceptLanguageResolver` reads
- Validation messages go through `i18nValidationMessage('validation.field.rule')`

---

## Prisma

- The schema is split by domain in `src/prisma/schema/`
- Field names are `camelCase` in the model and mapped with `@map` to the real `snake_case` column
- The connection URL lives in `prisma.config.ts`, not in the schema (Prisma 7 no longer accepts it there)
- Soft deletes are a nullable `deletedAt`; every listing filters by it

---

## Before committing

```bash
pnpm lint
npx tsc --noEmit
pnpm test
```

---

## Related projects

- `vue-starter-kit` — the Vue 3 SPA that consumes this API
- `react-starter-kit` — the React 19 SPA that consumes this API
