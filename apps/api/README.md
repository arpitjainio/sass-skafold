# API

NestJS backend for the SaaS Skafold starter.

## Local setup

From the repository root:

```bash
cp apps/api/.env.example apps/api/.env
pnpm --filter api run setup
pnpm --filter api dev
```

Default local URL:

```text
http://localhost:3001
```

Swagger docs:

```text
http://localhost:3001/api/v1/docs
```

For full workspace setup and known scaffold gaps, see:

- `README.md`
- `docs/usage.md`
