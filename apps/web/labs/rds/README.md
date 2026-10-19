# RDS lab — source

React + Cloudscape source for the interactive "Create database" lab
embedded at `/courses/aws-foundations/labs/rds`. See
`apps/web/labs/README.md` for how labs are built, embedded and added.

## Why isolated / embedded via iframe

See `apps/web/labs/ec2/README.md` — same reasoning (RTL Hebrew dark theme
vs. the real, light/LTR Cloudscape AWS console look), same `<iframe>`
embedding.

## Rebuilding

```sh
cd apps/web/labs/rds
bun install
bun run build
```

This bundles `client/index.jsx` with Bun's native bundler and writes
`bundle.js` + `bundle.css` into `apps/web/public/labs/rds/`, next to the
committed `index.html` shell.

## What's simulated vs. real

Everything here is a teaching mock:

- Engines, versions, instance classes, storage types, the default VPC,
  subnet group and security group are static data in `client/data.js`.
  Only MySQL, MariaDB and PostgreSQL can be chosen; the other engines are
  shown disabled so the page still looks like the real console.
- Picking a template (Production / Dev/Test / Free tier) pre-fills
  defaults the way the real console does, and Free tier limits the
  choices (Single-AZ, micro instance classes).
- The monthly cost in the summary panel is a rough example estimate
  (instance hours + storage, doubled for Multi-AZ), not a real AWS quote.
- "Create database" doesn't call any backend. `client/mockCreateDatabase.js`
  validates the form with the real console's rules (identifier, master
  username, password, storage, backup retention), then returns a fake
  endpoint, ARN, resource ID and — if requested — a generated password or
  a Secrets Manager secret ARN.
- On the database page the status goes Creating → Backing-up → Available
  on a timer, and the endpoint only appears once it's Available.

## Flow

1. **Create database** — creation method, engine and version, template,
   availability (Single-AZ / Multi-AZ), identifier and credentials,
   instance class, storage (with autoscaling), connectivity (VPC, public
   access, security group, AZ, port), authentication, and additional
   configuration (initial database, backups, encryption, deletion
   protection), with a live summary and cost estimate.
2. **Database page** — status, summary, "View connection details",
   connectivity & security (endpoint, port, networking, security groups,
   and a ready-to-run `mysql` / `psql` command), configuration, and
   maintenance & backups.
