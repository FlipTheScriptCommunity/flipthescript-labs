# Implementation Plan: Contributors Page

## Overview

Build the `/contributors` page in `apps/web` (TypeScript, Next.js 16, Bun + Nx). The work goes bottom-up. First the tooling (dependencies, Vitest config, raw-text YAML loader), then the pure parser and display helpers with tests, then the Server Components, the force-static page, and the header link. It ends with a full build, lint, typecheck, and bundle verification pass. Each step builds on the previous one, so no module is left unused by the end.

## Tasks

- [x] 1. Set up dependencies and test tooling for apps/web
  - [x] 1.1 Add pinned dependencies and the Vitest config
    - In `apps/web`, run `bun add -E yaml` (dependency) and `bun add -E -d fast-check` (devDependency); confirm exact versions (no `^`/`~`) in `apps/web/package.json` and the updated lockfile
    - Create `apps/web/vite.config.mts` mirroring `apps/api/vite.config.mts`: `root: import.meta.dirname`, `cacheDir: '../../node_modules/.vite/apps/web'`, `@` → `./src` alias, `environment: 'node'`, `globals: false`, `watch: false`, include `src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}`, v8 coverage under `./test-output/vitest/coverage`
    - Confirm `bunx nx show project web` now lists inferred `test` / `test-ci` targets, and that `apps/web/tsconfig.json` still excludes `src/**/*.spec.ts`
    - _Requirements: 3.2, 6.1, 6.2_

- [x] 2. Wire the YAML raw-text import into both bundlers
  - [x] 2.1 Create the loader, register it, and declare the module type
    - Create `apps/web/loaders/raw-text-loader.cjs` that returns `export default ${JSON.stringify(source)};`
    - In `apps/web/next.config.js`, keep the existing `output` and `outputFileTracingRoot`. Add `turbopack.rules['*.yaml'] = { loaders: [rawTextLoader], as: '*.js' }` and a `webpack` hook that pushes `{ test: /\.yaml$/, use: [rawTextLoader] }`
    - Add `declare module '*.yaml' { const content: string; export default content; }` to `apps/web/index.d.ts`
    - _Requirements: 3.7, 3.8, 3.9_

- [x] 3. Implement the pure contributors parser
  - [x] 3.1 Implement `apps/web/src/data/parse-contributors.ts`
    - Export `Contributor`, `OPTIONAL_FIELDS`, `OptionalField`, `ContributorField`, `ContributorsValidationError` (with `index?` and `field?`), `parseContributors(source)`, and `normalizeGithubUsername(value)`
    - Wrap `YAMLParseError` in `ContributorsValidationError`. Reject non-array top-level values, including `null` from an empty file
    - Per entry, in this order: entry must be a plain object → reject unknown keys (`field = key`) → `name` must be a non-empty trimmed string → present optional fields must be non-empty trimmed strings (`null` is invalid) → format checks (`github` username regex after normalization, which rejects repo URLs; `linkedin`/`website`/`x` must be absolute `http(s)` URLs; `image` must be an `http(s)` URL or a `/contributors/` path with no `..` segment)
    - Error messages use the format `contributors.yaml: entry at index N, field "f": <reason>`. Output keeps file order and leaves out absent keys entirely (no `undefined` values)
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 3.2 Write example-based unit tests in `apps/web/src/data/parse-contributors.spec.ts`
    - Import from `vitest` explicitly
    - Name-only entry returns `{ name }` with no other keys. A fully populated entry returns all fields
    - Missing `name`, empty `name`, and whitespace-only `name` throw with the correct `index` and `field: 'name'`
    - Invalid optional value (empty string, `null`, non-string) throws with `index` and `field`
    - Non-list top-level value (mapping, scalar, empty file) and malformed YAML (`- name: [unclosed`) throw `ContributorsValidationError`
    - Unknown key `linkdin`, `website: javascript:alert(1)`, `image: ../secret.png`, `image: /other/x.png`, and `github: https://github.com/user/repo` each throw with the matching `field`
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 6.1_

  - [ ]* 3.3 Write property test for parse round trip
    - **Property 1: Parse round trip preserves entries and order**
    - Add the shared generators (`validUsername`, `validUrl`, `validImage`, `validName`, `validContributor`). Serialize with `yaml.stringify` and use at least 100 runs
    - **Validates: Requirements 2.5, 3.3**

  - [ ]* 3.4 Write property test for invalid-entry location reporting
    - **Property 2: Invalid entries are reported with their location**
    - **Validates: Requirements 3.4, 3.5**

  - [ ]* 3.5 Write property test for non-list documents
    - **Property 3: Non-list documents are rejected**
    - **Validates: Requirements 3.6**

  - [ ]* 3.6 Write property test for GitHub username normalization
    - **Property 4: GitHub username normalization**
    - Cover all accepted forms (`u`, `@u`, `github.com/u`, `https://github.com/u`, `http://www.github.com/u/`) and idempotence
    - **Validates: Requirements 3.3, 4.2, 5.3**

- [x] 4. Checkpoint - Ensure all tests pass
  - Run `bunx nx test web`. Ensure all tests pass, ask the user if questions arise.

- [x] 5. Add the contributors data file and entry point
  - [x] 5.1 Create the seed data and local avatar folder
    - Create `apps/web/src/data/contributors.yaml` with the documented header comment (fields, image path rules, build-failure note) and the `FlipTheScript Community` seed entry from the design
    - Create `apps/web/public/contributors/.gitkeep`
    - _Requirements: 3.1, 4.1_

  - [x] 5.2 Create `apps/web/src/data/contributors.ts`
    - `import raw from './contributors.yaml'`, then `export const contributors: Contributor[] = parseContributors(raw)` at module scope, and re-export `type Contributor`
    - Match the export style of `src/data/courses.ts`
    - _Requirements: 3.1, 3.7, 3.8_

  - [x] 5.3 Add a committed-file test to `apps/web/src/data/parse-contributors.spec.ts`
    - Read `src/data/contributors.yaml` via `node:fs` (resolved relative to the spec file), and assert that `parseContributors` succeeds and returns at least one entry
    - _Requirements: 3.1, 6.3_

- [x] 6. Implement the display helpers
  - [x] 6.1 Implement `apps/web/src/components/contributors/contributor-display.ts`
    - `getAvatarSource` uses the precedence image → `https://github.com/<github>.png` → initials
    - `getInitials` uses `Array.from` so surrogate pairs aren't split. It takes the first code point of the first word, plus the first code point of the last word when there are 2+ words, uppercased
    - Export `SOCIAL_PLATFORMS` in the fixed order `github, linkedin, website, x`
    - `getSocialLinks` returns only the present fields, using the href and Hebrew label table from the design (each label ends with "(נפתח בכרטיסייה חדשה)")
    - Import the `Contributor` type only, from `@/data/contributors`
    - _Requirements: 4.1, 4.2, 4.3, 5.3, 5.4, 5.5, 5.6, 5.7, 5.9_

  - [x] 6.2 Write example-based unit tests in `apps/web/src/components/contributors/contributor-display.spec.ts`
    - One example each for `image`, the GitHub avatar fallback, and initials. Also cover `image` winning over `github`
    - Hebrew two-word name "דנה כהן" → "דכ". A single-word name gives one initial
    - `getSocialLinks` order and hrefs for a fully populated contributor, and an empty array when no social fields are present
    - _Requirements: 4.1, 4.2, 4.3, 5.7, 6.2_

  - [ ]* 6.3 Write property test for avatar source precedence
    - **Property 5: Avatar source precedence**
    - **Validates: Requirements 4.1, 4.2, 4.3**

  - [ ]* 6.4 Write property test for initials derivation
    - **Property 6: Initials are derived from the name**
    - **Validates: Requirements 4.3**

  - [ ]* 6.5 Write property test for social link presence and order
    - **Property 7: Social links match exactly the present fields**
    - **Validates: Requirements 5.3, 5.4, 5.5, 5.6, 5.7**

  - [ ]* 6.6 Write property test for social link labels
    - **Property 8: Social link labels name the platform and the contributor**
    - **Validates: Requirements 5.9**

- [x] 7. Checkpoint - Ensure all tests pass
  - Run `bunx nx test web`. Ensure all tests pass, ask the user if questions arise.

- [x] 8. Build the contributor UI components
  - [x] 8.1 Create `apps/web/src/components/contributors/social-icons.tsx`
    - Inline `GitHubIcon`, `LinkedInIcon`, and `XIcon` SVGs (`viewBox="0 0 24 24"`, `fill="currentColor"`, `aria-hidden="true"`, `focusable="false"`, `className` prop) using Simple Icons path data, with a CC0 attribution comment
    - Use `Globe` from `lucide-react` for the website icon, with `aria-hidden`
    - Export `SOCIAL_ICONS: Record<SocialPlatform, ComponentType<{ className?: string }>>`
    - _Requirements: 5.10_

  - [x] 8.2 Create `apps/web/src/components/contributors/contributor-card.tsx` (Server Component, no `'use client'`)
    - Render an `<article>` with the course-card styling (`rounded-xl border border-border bg-card`, `hover:border-primary`)
    - Avatar is a plain `<img>` (`alt` = name, 96×96, `loading="lazy"`, `decoding="async"`). The initials fallback is an `aria-hidden` circle. Both use a `border-[3px]` border that alternates `border-secondary` / `border-accent-purple` by index
    - Render the `h2` name and the optional muted `role` below it
    - Social links are a `<ul>` of `<a target="_blank" rel="noopener noreferrer" aria-label={label}>` items with white icons on `bg-secondary` / `bg-accent-purple` circles and a visible focus outline
    - If `@next/next/no-img-element` fires in lint, add a scoped `eslint-disable-next-line` with a one-line justification
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10_

- [x] 9. Add the page and the navigation link
  - [x] 9.1 Create `apps/web/src/app/contributors/page.tsx`
    - `export const dynamic = 'force-static'` and `metadata.title = 'משתתפים | FlipTheScript Labs'`
    - Layout: `SiteHeader`, a hero with `h1` "משתתפים" and a muted subtitle (classes copied from `courses/page.tsx`), a responsive `ul` grid (`sm:grid-cols-2 lg:grid-cols-3`) mapping `contributors` to `ContributorCard` in file order, then `SiteFooter`
    - No `'use client'` anywhere on the page's import path
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.7, 3.9_

  - [x] 9.2 Add the header nav entry in `apps/web/src/components/marketing/site-header.tsx`
    - Insert `{ label: 'משתתפים', href: '/contributors' }` into `navLinks` right after the `קורסים` entry. Make no other changes; the desktop nav and mobile dropdown both pick it up
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 10. Final verification
  - [x] 10.1 Run the full checks and confirm the static and bundle constraints
    - `bunx nx test web` passes
    - `bunx nx build web` succeeds, and the build output lists `/contributors` as a static (○) route
    - Failure path: temporarily set the seed entry's `name` to `""`, confirm `bunx nx build web` fails with a message naming index 0 and field `name`, then revert the change
    - Client bundle check: search `apps/web/.next/static` for a `yaml` library error string (e.g. `Implicit map keys need to be followed by map values`) and for the `contributors.yaml` header comment text. Both must return no matches
    - `bunx nx run-many -t lint` and `bunx nx run-many -t typecheck` pass with no new errors (web has no inferred `typecheck` target, so `next build`'s TypeScript check is the type gate for app code)
    - Fix any issues found and re-run the affected checks
    - _Requirements: 2.1, 3.4, 3.7, 3.8, 3.9, 6.3, 6.4_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP. The example-based unit tests (3.2, 5.3, 6.2) are required by Requirement 6 and are not optional.
- Property tests use `fast-check` with at least 100 runs each and are tagged `// Feature: contributors-page, Property N: <title>`.
- Tests never import `contributors.ts` (the `.yaml` import), so Vitest needs no YAML transform.
- Manual checks from the design (`bunx nx preview web` in workerd, desktop and mobile nav, visual styling, assistive-technology testing) are outside this coding plan and should be done by a person.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "5.1"] },
    { "id": 1, "tasks": ["3.1"] },
    { "id": 2, "tasks": ["3.2", "5.2"] },
    { "id": 3, "tasks": ["3.3", "6.1"] },
    { "id": 4, "tasks": ["3.4", "6.2", "8.1"] },
    { "id": 5, "tasks": ["3.5", "6.3", "8.2"] },
    { "id": 6, "tasks": ["3.6", "6.4", "9.1"] },
    { "id": 7, "tasks": ["5.3", "6.5", "9.2"] },
    { "id": 8, "tasks": ["6.6"] },
    { "id": 9, "tasks": ["10.1"] }
  ]
}
```
