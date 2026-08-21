# EC2 lab — source

React + Cloudscape source for the interactive "Launch an instance" lab
embedded at `/courses/aws-foundations/labs/ec2`.

This is intentionally **isolated** from the rest of `apps/web`: it has its
own `package.json`/`bun.lock` and is not a dependency of the Next.js app.
The app only ever loads the pre-built static output — it has zero React 19 /
Next.js coupling and doesn't need Cloudscape (a large, opinionated design
system) anywhere near the site's own Tailwind/shadcn/RTL dark theme.

## Why isolated / embedded via iframe

`apps/web` is RTL Hebrew with a dark "cyber" theme (see
`apps/web/docs/FlipTheScript_Design_Guidelines.md`). This lab intentionally
keeps the real AWS Console look — light theme, LTR, Cloudscape's own design
tokens — because that's the point of the exercise (it should feel like the
real EC2 console). Loading Cloudscape's global stylesheet directly into the
Next app's page would leak global resets into the rest of the SPA. The lab
page (`apps/web/src/app/courses/[courseId]/labs/[labId]/page.tsx`) embeds
the built bundle in a sandboxed `<iframe>` instead, so the two design
systems never touch.

## Rebuilding

```sh
cd apps/web/labs/ec2
bun install
bun run build
```

This bundles `client/index.jsx` with Bun's native bundler and writes
`bundle.js` + `bundle.css` into `apps/web/public/labs/ec2/`, alongside the
`index.html` shell that's already committed there. Nothing else in the repo
needs to change or rebuild — `apps/web/public/labs/ec2/` is served as-is by
Next.js.

## What's simulated vs. real

Everything here is a teaching mock:

- All AMIs, instance types, VPCs, subnets, and pricing are static data in
  `client/data.js`.
- "Launch instance" doesn't call any backend — `client/mockLaunch.js` fakes
  a short delay and returns fake instance IDs, entirely in the browser.
- A guided walkthrough (`client/TutorialOverlay.jsx` +
  `client/tutorialSteps.js`) opens automatically, spotlighting each section
  of the form with a plain-language explanation, aimed at students doing
  this for the first time.
