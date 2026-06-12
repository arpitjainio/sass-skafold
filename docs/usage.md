# Usage Guide

## Overview

This repository is a pnpm + Turborepo monorepo with:

- `apps/web`: Next.js frontend
- `apps/api`: NestJS backend
- `packages/*`: shared UI, design tokens, utilities, and config
- `prisma`: shared schema and migrations

## Environment files

### Root `.env`

Used by Prisma commands run from the repository root.

Required:

- `DATABASE_URL`

### `apps/api/.env`

Used by the NestJS API.

Required:

- `DATABASE_URL`
- `JWT_SECRET`

Optional:

- `JWT_EXPIRES_IN`
- `PORT`
- `NODE_ENV`
- `FRONTEND_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `LOG_LEVEL`
- `LOG_FILE_PATH`
- `REDIS_URL`

### `apps/web/.env.local`

Used by the Next.js frontend.

Required:

- `NEXT_PUBLIC_API_URL`

## Local development

Install dependencies:

```bash
pnpm install
```

The install step generates the Prisma client automatically.

Copy env files:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Prepare the database:

```bash
pnpm db:setup
```

If you update `prisma/schema.prisma` without creating a migration, run `pnpm db:generate` before building or testing.

## Database migrations

Use the root migration scripts for all local and deployment workflows:

```bash
pnpm db:setup
pnpm db:migrate -- --name add_user_profile_fields
pnpm db:migrate:new -- --name add_user_profile_fields
pnpm db:migrate:reset
pnpm db:migrate:resolve -- --rolled-back 20250718164617_init
pnpm db:migrate:status
pnpm db:migrate:deploy
```

- `pnpm db:setup`: use this for a fresh local setup; it applies local migrations and runs the API setup script
- `pnpm db:migrate -- --name <migration_name>`: creates and applies a new development migration
- `pnpm db:migrate:new -- --name <migration_name>`: creates a migration file without applying it yet
- `pnpm db:migrate:reset`: use this as the local rollback/reset flow; it recreates the database from the migration history and deletes existing data
- `pnpm db:migrate:resolve -- --rolled-back <migration_id>`: use this only when you have manually rolled back a migration and need Prisma's migration history to match
- `pnpm db:migrate:status`: checks the current migration state for the configured database
- `pnpm db:migrate:deploy`: applies pending migrations in staging or production

Start everything:

```bash
pnpm dev
```

## API docs

When the API is running locally, Swagger is available at:

```text
http://localhost:3001/api/v1/docs
```

## Roles and admin setup

The setup script seeds the default roles:

- `admin`
- `user`
- `premium`

If you want to give a local account admin access during development:

1. Register a user in the frontend.
2. Call `POST /api/v1/dev/setup` with `{ "userEmail": "you@example.com" }` while `NODE_ENV=development`.

The development setup route is not loaded in production mode.

## Billing notes

Stripe is optional.

- The API now boots without Stripe keys.
- Billing routes only work after `STRIPE_SECRET_KEY` is configured.
- Webhook verification requires `STRIPE_WEBHOOK_SECRET`.

## Known scaffold gaps

These areas are intentionally left for product-specific implementation:

- Password reset backend endpoints
- Social login/OAuth integrations
- Transactional email delivery
- Production-grade token revocation storage
- Stripe product catalog and subscription plan setup

Treat the repository as a solid base, not a fully finished SaaS.
