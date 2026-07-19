# flipthescript-academy

The official monorepo workspace for FlipTheScript Academy — powered by Nx, Bun, Next.js, shadcn/ui, and a serverless AWS Lambda + DynamoDB backend.

## Stack

- **Monorepo**: [Nx](https://nx.dev), package manager and script runner: [Bun](https://bun.sh)
- **Frontend** (`apps/web`): Next.js (App Router) + [shadcn/ui](https://ui.shadcn.com), deployed to Cloudflare Pages today, AWS later
- **Backend** (`apps/api`): AWS Lambda handlers written in TypeScript, bundled with esbuild
- **Database**: Amazon DynamoDB, accessed through `libs/dynamo-client`
- **Infrastructure** (`infra/cdk`): AWS CDK (TypeScript) stacks provisioning the Lambda functions, HTTP API, and DynamoDB tables

## Project layout

```
apps/
  web/            Next.js frontend (App Router, shadcn/ui, Tailwind CSS)
  api/             AWS Lambda handlers (bundled individually with esbuild)
libs/
  shared-types/    TypeScript types/DTOs shared across web and api
  dynamo-client/   Shared DynamoDB Document Client wrapper
infra/
  cdk/             AWS CDK app: DynamoDB tables, Lambda functions, HTTP API
```

## Getting started

```sh
bun install
```

Copy the environment template and fill in local values:

```sh
cp .env.example .env
```

## Common tasks

Run any Nx target with:

```sh
bunx nx run <project>:<target>
```

| Task                      | Command                         |
| ------------------------- | ------------------------------- |
| Start the web app locally | `bunx nx dev web`               |
| Build the web app         | `bunx nx build web`             |
| Build the Lambda handlers | `bunx nx build api`             |
| Lint everything           | `bunx nx run-many -t lint`      |
| Typecheck everything      | `bunx nx run-many -t typecheck` |
| Build everything          | `bunx nx run-many -t build`     |
| View the project graph    | `bunx nx graph`                 |

## Deploying infrastructure (AWS CDK)

```sh
cd infra/cdk
bunx cdk synth     # or: bunx nx synth infra-cdk
bunx cdk diff
bunx cdk deploy --all
```

## Deploying the web app (Cloudflare Pages)

```sh
cd apps/web
bun run pages:build
bunx wrangler pages deploy .vercel/output/static
```
