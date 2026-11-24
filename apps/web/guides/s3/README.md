# S3 guide — source

React + Cloudscape source for the interactive "Create bucket" + "Upload a
file" guide embedded at `/tracks/aws-foundations/guides/s3`.

This is intentionally **isolated** from the rest of `apps/web`: it has its
own `package.json`/`bun.lock` and is not a dependency of the Next.js app.
The app only ever loads the pre-built static output — it has zero React 19 /
Next.js coupling and doesn't need Cloudscape (a large, opinionated design
system) anywhere near the site's own Tailwind/shadcn/RTL dark theme.

## Why isolated / embedded via iframe

`apps/web` is RTL Hebrew with a dark "cyber" theme (see
`apps/web/docs/FlipTheScript_Design_Guidelines.md`). This guide intentionally
keeps the real AWS Console look — light theme, LTR, Cloudscape's own design
tokens — because that's the point of the exercise (it should feel like the
real S3 console). Loading Cloudscape's global stylesheet directly into the
Next app's page would leak global resets into the rest of the SPA. The guide
page (`apps/web/src/app/tracks/[trackId]/guides/[guideId]/page.tsx`) embeds
the built bundle in a sandboxed `<iframe>` instead, so the two design
systems never touch. See `apps/web/guides/ec2/README.md` for the sibling guide
this one was modeled on.

## Rebuilding

```sh
cd apps/web/guides/s3
bun install
bun run build
```

This bundles `client/index.jsx` with Bun's native bundler and writes
`bundle.js` + `bundle.css` into `apps/web/public/guides/s3/`, alongside the
`index.html` shell that's already committed there. Nothing else in the repo
needs to change or rebuild — `apps/web/public/guides/s3/` is served as-is by
Next.js.

## What's simulated vs. real

Everything here is a teaching mock:

- All regions, storage classes, and KMS keys are static data in
  `client/data.js`.
- "Create bucket" doesn't call any backend — `client/mockCreateBucket.js`
  validates the bucket name against S3's real naming rules, fakes a short
  delay, and returns a fake ARN. "Upload" similarly fakes a `PutObject` call
  in `client/mockUpload.js` — the chosen file's name/size are read locally,
  nothing is actually transmitted anywhere.
- Two short guided walkthroughs (`client/TutorialOverlay.jsx` +
  `client/tutorialSteps.js`, one for each screen) open automatically,
  spotlighting each section of the current form with a plain-language
  explanation, aimed at students doing this for the first time.

## Flow

1. **Create bucket** — general configuration (name/Region), Object
   Ownership, Block Public Access, Bucket Versioning, Tags, default
   encryption, and Object Lock (advanced/optional), ending in a live
   Summary panel.
2. **Objects** — the new bucket's (initially empty) object list, with an
   **Upload** button.
3. **Upload** — pick a file, optional key prefix, storage class, then
   upload; ends on a status screen with the created object's key, size, and
   `s3://` URI, then back to the Objects list showing the new row.
