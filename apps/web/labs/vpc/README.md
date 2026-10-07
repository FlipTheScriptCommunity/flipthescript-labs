# VPC lab — source

React + Cloudscape source for the interactive "Create VPC" ("VPC and more")
lab embedded at `/courses/aws-foundations/labs/vpc`.

This is intentionally **isolated** from the rest of `apps/web`: it has its
own `package.json`/`bun.lock` and is not a dependency of the Next.js app.
The app only ever loads the pre-built static output — it has zero React 19 /
Next.js coupling and doesn't need Cloudscape (a large, opinionated design
system) anywhere near the site's own Tailwind/shadcn/RTL dark theme.

## Why isolated / embedded via iframe

See `apps/web/labs/ec2/README.md` — same reasoning (RTL Hebrew dark theme
vs. the real, light/LTR Cloudscape AWS console look), same `<iframe>`
embedding via `apps/web/src/app/courses/[courseId]/labs/[labId]/page.tsx`.

## Rebuilding

```sh
cd apps/web/labs/vpc
bun install
bun run build
```

This bundles `client/index.jsx` with Bun's native bundler and writes
`bundle.js` + `bundle.css` into `apps/web/public/labs/vpc/`, alongside the
`index.html` shell that's already committed there. Nothing else in the repo
needs to change or rebuild — `apps/web/public/labs/vpc/` is served as-is by
Next.js.

## What's simulated vs. real

Everything here is a teaching mock:

- AZ letters, NAT/endpoint/tenancy options are static data in `client/data.js`.
- "Create VPC" doesn't call any backend — `client/mockCreateVpc.js`
  validates the IPv4 CIDR block against the same rules the real console
  enforces (/16–/28), derives plausible (not real) subnet CIDRs, fakes a
  short delay, and returns fake ids for the VPC, subnets, route tables,
  internet gateway, NAT gateway(s), and S3 endpoint.
- A guided walkthrough (`client/TutorialOverlay.jsx` + `client/tutorialSteps.js`)
  opens automatically, spotlighting each section of the form with a
  plain-language explanation, aimed at students doing this for the first
  time.

## The resource map

`client/sections/ResourceMap.jsx` is a simplified version of the diagram
AWS's own "VPC and more" wizard draws live as you adjust the form — one
column per Availability Zone, public/private subnet boxes, an internet
gateway badge, NAT gateway badges, and an S3 endpoint badge. The same
component is reused, unchanged, on the post-creation result screen — just
fed the real generated ids instead of the live preview's placeholder plan —
so "what you're about to get" and "what you got" look identical.

## Flow

1. **Create VPC** — name-tag prefix, IPv4/IPv6 CIDR, tenancy, Availability
   Zones + public/private subnet counts, NAT gateways, VPC endpoints, and
   DNS options, with a live resource-map preview and a Create VPC button.
2. **Result** — the created VPC's resource map (now with real ids), a
   details panel, and a table of every subnet that was created.
