# GitHub OSS Launch Guide

## Before making the repository public

- Confirm no secrets have ever been committed, not just the current working tree.
- Review branding, support links, and package metadata for personal or paid-product language.
- Make sure `README.md`, `LICENSE`, and env example files are present and accurate.
- Decide your support model up front: issues only, discussions, community PRs, or paid consulting on top.

## Recommended GitHub updates

### Repository settings

- Add a clear repo description focused on the outcome, not only the stack.
- Add relevant topics such as `saas`, `starter`, `nextjs`, `nestjs`, `prisma`, `turborepo`, `typescript`.
- Upload a social preview image or demo screenshot.
- Mark the repository as a template if you want people to generate their own copy cleanly.

### Community setup

- Enable Issues with a bug report and feature request template.
- Enable Discussions if you want questions and showcase posts outside Issues.
- Add a `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` if you want outside contributions immediately.
- Add branch protection on the default branch once you start accepting PRs.

### Security and maintenance

- Enable Dependabot alerts and updates.
- Enable secret scanning if your GitHub plan supports it.
- Add a `SECURITY.md` if you want a private reporting path for vulnerabilities.

## Suggested repo copy

### Short description

`Open-source SaaS starter with Next.js, NestJS, Prisma, JWT auth, RBAC, and optional Stripe billing.`

### README positioning

Lead with:

- who it is for
- what is already built
- what still needs implementation
- how fast someone can run it locally

## Launch checklist

1. Push the license and documentation changes.
2. Verify the repo home page shows the MIT license.
3. Add topics, description, and social preview image.
4. Decide whether to enable template repository mode.
5. Publish a `v0.1.0` or `v1.0.0` GitHub release with screenshots and setup notes.
6. Pin one issue or discussion with roadmap items and known gaps.

## Promotion ideas

### What to publish

- A short demo GIF of auth, dashboard, and admin flows
- One architecture diagram showing FE, BE, Prisma, and shared packages
- A launch post with "what problem this starter removes"
- A comparison list showing how this differs from a plain Next.js starter

### Where to share

- X / Twitter
- LinkedIn
- dev.to
- Hashnode
- Indie Hackers
- Hacker News as a `Show HN` post if you have a real story or clear angle
- Relevant Discord or Slack communities that allow launches

### Messaging angle that usually works

Focus less on "another starter" and more on:

- monorepo + FE/BE already wired
- auth and RBAC already scaffolded
- Prisma schema and admin flows included
- optional billing instead of mandatory vendor lock-in
- MIT license with no royalty requirement

## After launch

- Respond quickly to the first issues and setup questions.
- Turn recurring setup questions into README improvements.
- Keep a public roadmap so people know what is stable vs planned.
- Share small follow-up updates when you add meaningful capabilities.
