# flipthescript-academy

The official monorepo workspace for FlipTheScript Academy — powered by Nx, Bun, Next.js, shadcn/ui, and a serverless AWS Lambda + DynamoDB backend.

## Stack

- **Monorepo**: [Nx](https://nx.dev), package manager and script runner: [Bun](https://bun.sh)
- **Frontend** (`apps/web`): Next.js (App Router) + [shadcn/ui](https://ui.shadcn.com), deployed to Cloudflare Workers via the [OpenNext](https://opennext.js.org/cloudflare) adapter
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

## Deploying the web app (Cloudflare Workers)

`apps/web` is deployed to Cloudflare Workers with the
[OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare), which packages the
Next.js standalone build into a Worker (`.open-next/worker.js`) plus static assets
(`.open-next/assets`). Config lives in `apps/web/wrangler.jsonc` and
`apps/web/open-next.config.ts`.

| Task                                        | Command                  |
| ------------------------------------------- | ------------------------ |
| Build the Worker bundle                     | `bunx nx cf:build web`   |
| Run the Worker locally (workerd, like prod) | `bunx nx preview web`    |
| Build + deploy by hand                      | `bunx nx deploy web`     |
| Deploy an already-built bundle              | `bunx nx cf:deploy web`  |
| Upload a preview version of a built bundle  | `bunx nx cf:upload web`  |
| Regenerate Cloudflare binding types         | `bunx nx cf-typegen web` |

`bunx nx dev web` still runs the normal Next.js dev server; use `preview` when you want
the real Workers runtime. Neither needs a Cloudflare account, so contributors can check
their changes against the production runtime without any credentials.

### Continuous deployment (Cloudflare Workers Builds)

Deploys are driven by Cloudflare's Git integration, not by CI — there is no deploy
workflow and no Cloudflare API token in this repository. Set it up once in the dashboard
under **Workers & Pages → flipthescript-labs-web → Settings → Build**:

| Setting                              | Value                                       |
| ------------------------------------ | ------------------------------------------- |
| Repository                           | `FlipTheScriptCommunity/flipthescript-labs` |
| Production branch                    | `main`                                      |
| Root directory                       | _(leave empty — the repo root)_             |
| Build command                        | `bunx nx cf:build web`                      |
| Deploy command                       | `bunx nx cf:deploy web`                     |
| Non-production branch deploy command | `bunx nx cf:upload web`                     |
| Build variable                       | `NEXT_PUBLIC_API_URL` = public API base URL |

The root directory stays at the repo root so `bun install` resolves the Bun workspace;
the Nx targets then run inside `apps/web`, where `wrangler.jsonc` and the pinned wrangler
binary live. `NEXT_PUBLIC_*` values are inlined at build time, so they belong in **Build
variables and secrets**, not in the Worker's runtime variables.

Turn on non-production branch builds (**Settings → Build → Branch control**) to get a
preview URL and a pull request comment for every branch pushed to this repository.

Contributions from forks: Cloudflare builds branches that live in this repository, and a
fork's PR commits do not, so those PRs get no hosted preview. Contributors preview
locally with `bunx nx preview web`; a maintainer who wants a hosted preview can push the
branch to this repository.

### Custom domain

Add a `routes` entry to `apps/web/wrangler.jsonc` once a domain is on Cloudflare:

```jsonc
"routes": [{ "pattern": "labs.example.com", "custom_domain": true }]
```
