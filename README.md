# NestJS Prisma Starter Kit

This project is a starter kit for building APIs with `NestJS`. It uses `Prisma` as the ORM and includes ready-to-use CRUD modules for `Users`, `Roles`, and `Permissions`. Authentication is implemented with `Passport` using `JWT`.

## Features

- NestJS framework with modular architecture
- Prisma ORM for database access and migrations
- CRUD for users, roles, and permissions
- Authentication with Passport JWT
- Internationalization with `nestjs-i18n` (translation files in `src/i18n/{language}/{module}.json`)

## Environment Variables

- `APP_KEY`: Application-wide key used for cryptographic operations. Use a 32-character secure string.
- `DATABASE_URL`: Prisma database connection string. Format: `mysql://<user>:<password>@<host>:<port>/<database>`.
- `JWT_SECRET`: Secret key used to sign and verify JWT tokens.

## Run the Project

- Install dependencies: `npm install`
- Start in development: `npm run start:dev`

The API listens on `http://localhost:3000` by default.

## Database

- Migrate schema: `npx prisma migrate dev`
- Run seeders: `npx prisma db seed`

## Global Configuration

This project uses `@nestjs/config` as a global configuration module to centralize application settings and read values from environment variables.

- Config files live under `src/config/`:
  - `src/config/AppConfig.ts` provides application settings.
  - `src/config/CorsConfig.ts` provides CORS settings.
