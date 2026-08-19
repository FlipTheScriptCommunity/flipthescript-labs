# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

FlipTheScript Academy — an Nx monorepo using Bun as the package manager and script runner.

- **Frontend** (`apps/web`): Next.js 16 (App Router) + shadcn/ui + Tailwind CSS v4, deployed to Cloudflare Pages today (AWS later). RTL Hebrew UI (`dir="rtl"`, `lang="he"`), dark "cyber" theme documented in `apps/web/docs/FlipTheScript_Design_Guidelines.md`.
- **Backend** (`apps/api`): AWS Lambda handlers written in TypeScript, bundled individually with esbuild.
- **Database**: Amazon DynamoDB, accessed only through `libs/dynamo-client` (a shared `DynamoDBDocumentClient` wrapper, reused across Lambda invocations — never instantiate a new client elsewhere).
- **Shared types**: `libs/shared-types` holds DTOs (e.g. `Course`, `User`) shared between `apps/web` and `apps/api`.
- **Infrastructure** (`infra/cdk`): AWS CDK (TypeScript) app provisioning DynamoDB tables (`DataStack`), and Lambda functions + HTTP API (`ApiStack`, which takes the table from `DataStack` as a prop). Entry point: `infra/cdk/bin/app.ts`.

Current state: the API only exposes `GET /health` and `GET /courses` (a DynamoDB scan of a single `flipthescript-academy-courses` table). The `apps/web` frontend courses/labs content is currently static data (`apps/web/src/data/courses.ts`), not yet wired to the API.

## Branding conventions

- The product is named **FlipTheScript Labs** — never "Academy". Update all UI text, page titles, and metadata accordingly.
- The site header logo (`SiteHeader` in `apps/web/src/components/marketing/site-header.tsx`) must always link to `/` (the homepage).

## Commands

Always run tasks through Nx, prefixed with `bunx` (the CLI isn't installed globally):

```sh
bun install                          # install deps
bunx nx dev web                      # run the web app locally
bunx nx build web                    # build the web app
bunx nx build api                    # build the Lambda handlers
bunx nx run-many -t lint             # lint everything
bunx nx run-many -t typecheck        # typecheck everything
bunx nx run-many -t build            # build everything
bunx nx test <project>               # run a project's vitest suite (watch mode)
bunx nx test-ci <project>            # run a project's vitest suite once (CI mode)
bunx nx graph                        # view the project graph
```

To run a single test file/case, use vitest's own filtering through the Nx target, e.g.:
```sh
bunx nx test api -- health.spec.ts
bunx nx test api -- -t "returns a 200 status"
```

Web app targets also include `pages:build` (Cloudflare Pages build via `next-on-pages`).

### Deploying infrastructure (AWS CDK)

```sh
cd infra/cdk
bunx cdk synth     # or: bunx nx synth infra-cdk
bunx cdk diff
bunx cdk deploy --all
```

### Deploying the web app (Cloudflare Pages)

```sh
cd apps/web
bun run pages:build
bunx wrangler pages deploy .vercel/output/static
```

## Architecture notes

- **Module boundaries**: enforced via `@nx/enforce-module-boundaries` in the root `eslint.config.mjs`. Cross-project imports must go through each project's public entry point (e.g. `libs/dynamo-client/src/index.ts`, `libs/shared-types/src/index.ts`), not deep-imported paths.
- **CDK stacks are wired by dependency injection**: `ApiStack` receives `coursesTable` from `DataStack` as a constructor prop (see `infra/cdk/bin/app.ts`) rather than looking it up — follow this pattern when adding new stacks/resources.
- **Lambda handlers** (`apps/api/src/handlers/*.ts`) are plain `APIGatewayProxyHandler` functions, each with a co-located `.spec.ts` vitest test. New handlers should be registered in `infra/cdk/lib/api-stack.ts` as a `NodejsFunction` + `httpApi.addRoutes(...)` pair, granted least-privilege DynamoDB access via `table.grantReadData`/`grantWriteData`.
- **Env vars**: see `.env.example` for the full set (`AWS_REGION`, `COURSES_TABLE_NAME`, `NEXT_PUBLIC_API_URL`). Lambda handlers read table names from `process.env`.
- **apps/web routing**: Next.js App Router under `apps/web/src/app`. Marketing sections live in `apps/web/src/components/marketing`; shared UI primitives (shadcn-style, `class-variance-authority` + `@base-ui/react`) live in `apps/web/src/components/ui`. Course/lab content routes (`/courses`, `/courses/[courseId]`, `/courses/[courseId]/labs/[labId]`) read from `apps/web/src/data/courses.ts` — update that file's `courses` array to add/edit course or lab content until it's backed by the API.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
