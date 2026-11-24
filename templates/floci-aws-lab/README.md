# FlipTheScript Labs — AWS Lab: S3 + Lambda

A guided, hands-on AWS lab that runs entirely inside a GitHub Codespace. You get
an AWS-style console (built with [Cloudscape](https://cloudscape.design/), the
AWS console's own design system) wired to [Floci](https://floci.io/), a local
AWS emulator, plus structured challenges, a bilingual (Hebrew / English)
tutorial, and a **Check my work** button that tells you whether you succeeded.

Everything you create is real — real S3 and Lambda API calls, real Lambda
containers — but free, and nowhere near a real AWS account.

> **עברית:** מעבדה מודרכת ל-S3 ו-Lambda שרצה כולה בתוך GitHub Codespace. פתחו
> את ה-Codespace, הקונסולה תיפתח לבד, ובחרו אתגר. ההדרכה והאתגרים זמינים
> בעברית ובאנגלית.

## Start the lab

1. Choose **Code → Codespaces → Create codespace on main**.
2. Wait for setup to finish (the first start pulls Floci and the Lambda Node.js
   image; a prebuilt Codespace skips this).
3. The **AWS Lab Console** opens in a preview tab automatically. If it doesn't,
   open the **Ports** tab and open port **5173**.
4. Pick a challenge on the lab home page and follow the guided tutorial.

## Challenges

| #   | Challenge                     | You'll learn                                                                                                 |
| --- | ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1   | Your first S3 bucket          | Buckets vs. objects, bucket naming rules, keys, Block Public Access                                          |
| 2   | Deploy a Lambda that reads S3 | Handlers and events, calling S3 from Lambda with the AWS SDK, execution roles, the edit → Deploy → Test loop |

**Check my work** inspects the resources you actually created in Floci (not
which buttons you clicked), and explains what's missing when a task fails.

## Use the terminal too

The Codespace's AWS CLI is already pointed at Floci (`AWS_ENDPOINT_URL` and
dummy credentials are set in `.devcontainer/devcontainer.json`):

```sh
aws s3 ls
aws s3 cp ./notes.txt s3://fts-lab-data/
aws lambda invoke --function-name read-s3-object out.json && cat out.json
```

## How it works

```
 browser (Codespace preview, port 5173)
   │  AWS SDK v3 calls, signed with SigV4, sent to the page's own origin
   ▼
 Vite dev server ── vite/floci-proxy.ts forwards AWS requests ──▶ Floci :4566
                                                                   │
                                                  Lambda invokes ─▶ docker (public.ecr.aws/lambda/nodejs:22)
```

- The console uses the real AWS SDK in the browser. The dev server forwards
  anything with a SigV4 `Authorization` header to Floci, so there's no CORS to
  configure and it works behind the Codespace's forwarded URL. Open your
  browser's dev tools → Network tab to watch the real API calls.
- Floci runs Lambda functions as real containers through Docker (the Codespace
  has Docker-in-Docker), and injects `AWS_ENDPOINT_URL` into them — so the
  code you write is exactly what you'd deploy to real AWS.

## Troubleshooting

| Symptom                             | Fix                                                                              |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| Red "Floci is not running" banner   | `docker compose up -d`, wait a few seconds                                       |
| Console tab closed / port 5173 dead | `bun run dev` in a terminal                                                      |
| First Lambda test is slow           | Normal — a cold start pulls/starts the runtime container; later invokes are fast |
| Want a clean slate                  | `docker compose restart` (Floci keeps state in memory)                           |

## Developing the lab

```sh
bun install
docker compose up -d   # Floci on :4566
bun run dev            # console on :5173
bun run test           # unit tests (routing, naming rules, proxy, challenge checks)
bun run typecheck
```

- Challenges and their checks: `src/challenges/challenges.ts`
- Tutorial steps (Hebrew + English): `src/tutorial/tutorials.ts`
- Console pages: `src/services/s3/`, `src/services/lambda/`

### Where this lives

This folder is developed inside the FlipTheScript Labs platform monorepo
(`templates/floci-aws-lab`) and published as its own template repository, so
students' Codespaces only clone the lab itself. To publish an update:

```sh
# from the monorepo root
git subtree split --prefix templates/floci-aws-lab -b floci-aws-lab-template
git push <template-repo-remote> floci-aws-lab-template:main
```

Mark the target repo as a **template repository** in its GitHub settings, and
enable Codespaces prebuilds for `main` so students skip the image pulls.
