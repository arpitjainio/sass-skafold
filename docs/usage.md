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

Copy env files:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Prepare the database:

```bash
pnpm prisma generate
pnpm prisma migrate dev
pnpm --filter api setup
```

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
