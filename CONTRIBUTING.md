# Contributing

Thanks for contributing to SaaS Skafold.

## Before you start

- Read the [README](README.md) and [usage guide](docs/usage.md).
- Check existing issues and pull requests before starting overlapping work.
- For larger changes, open an issue or discussion first so the direction is aligned.

## Local setup

```bash
pnpm install
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
pnpm prisma migrate dev
pnpm --filter api setup
pnpm dev
```

If you change the Prisma schema, run `pnpm prisma generate` before opening a PR.

## Development expectations

- Keep changes focused and easy to review.
- Preserve the monorepo structure and shared package boundaries.
- Update documentation when behavior or setup changes.
- Prefer additive, template-friendly defaults over product-specific assumptions.

## Validation

Before opening a pull request, run the checks relevant to your change:

```bash
pnpm check-types
pnpm lint
pnpm build
pnpm --filter api test
```

If a check cannot be run in your environment, mention that in the pull request.

## Pull requests

Good pull requests usually include:

- a clear summary of the problem
- the approach taken
- screenshots or short recordings for UI changes
- notes about follow-up work or intentional limitations

## Scope

This repository is an open-source starter, so the bar for changes is slightly different from an end-product app:

- prefer reusable primitives over one-off branding
- keep integrations optional where possible
- document scaffold gaps honestly instead of hiding them
