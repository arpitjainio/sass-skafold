# SaaS Skafold

Open-source full-stack SaaS starter built as a monorepo with a Next.js frontend, a NestJS API, Prisma, JWT auth, RBAC, and shared UI packages.

The goal of this repository is to give teams a clean starting point for a SaaS product without licensing fees or royalties. You can use it for personal or commercial work under the MIT license.

## What is included

- Next.js 16 web app with auth screens and dashboard scaffolding
- NestJS API with JWT auth, user management, roles, and admin endpoints
- Prisma 7 schema, generated client, and migrations for PostgreSQL
- Shared design system and UI component packages
- Optional Stripe subscription scaffolding
- Turborepo + pnpm monorepo setup

## Monorepo layout

```text
.
├── apps
│   ├── api
│   └── web
├── packages
│   ├── config-eslint
│   ├── config-typescript
│   ├── design-system
│   ├── ui
│   └── utils
├── prisma
└── docs
```

## Quick start

### Prerequisites

- Node.js 20.19+
- pnpm 9+
- PostgreSQL

### Install

```bash
pnpm install
```

`pnpm install` now generates the Prisma client automatically through the root `postinstall` script.

### Configure environment variables

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Update the copied files with your local values:

- `.env`: used by Prisma commands run from the repo root
- `apps/api/.env`: used by the NestJS API
- `apps/web/.env.local`: used by the Next.js app

### Set up the database

```bash
pnpm db:setup
```

Run `pnpm db:generate` manually whenever you change `prisma/schema.prisma` without creating a migration.

### Start the apps

```bash
pnpm dev
```

Default local URLs:

- Web: `http://localhost:3000`
- API: `http://localhost:3001`
- Swagger: `http://localhost:3001/api/v1/docs`

## Useful commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm check-types
pnpm test
pnpm db:setup
pnpm db:migrate -- --name add_user_profile_fields
pnpm db:migrate:new -- --name add_user_profile_fields
pnpm db:migrate:reset
pnpm db:migrate:deploy
pnpm --filter api test
pnpm --filter web type-check
```

## Database migrations

Use the root migration scripts for Prisma workflows:

```bash
pnpm db:setup
pnpm db:migrate -- --name add_user_profile_fields
pnpm db:migrate:new -- --name add_user_profile_fields
pnpm db:migrate:reset
pnpm db:migrate:resolve -- --rolled-back 20250718164617_init
pnpm db:migrate:status
pnpm db:migrate:deploy
```

- `pnpm db:setup`: fresh local setup; runs local migrations and then the API setup script
- `pnpm db:migrate -- --name <migration_name>`: creates and applies a new migration during development
- `pnpm db:migrate:new -- --name <migration_name>`: generates a new migration without applying it yet
- `pnpm db:migrate:reset`: local rollback/reset flow; drops the database, reapplies all migrations, and removes existing data
- `pnpm db:migrate:resolve -- --rolled-back <migration_id>`: marks a migration as rolled back after you manually undo it in the database
- `pnpm db:migrate:deploy`: applies pending migrations in staging or production

## What is production-ready vs scaffolded

Already wired:

- Email/password registration and login
- JWT-protected API routes
- User profile endpoints
- Role and admin management scaffolding
- Shared UI/design-system packages

Still intended for product-specific implementation:

- Password reset backend flow
- Social login/OAuth providers
- Transactional email delivery
- Stripe product and price configuration
- Deployment and infra automation

## Documentation

- [Usage guide](docs/usage.md)
- [GitHub OSS launch guide](docs/open-source-launch.md)

## Open-source usage

This project is licensed under the MIT License. That means you can use, modify, distribute, and commercialize it without paying a fee or royalty, as long as the license notice stays with the software.

## Contributing

Issues and pull requests are welcome.

- Contribution guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Code of conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- Security policy: [SECURITY.md](SECURITY.md)
