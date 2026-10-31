# Design Document: Contributors Page

## Overview

The feature adds a statically rendered `/contributors` route ("משתתפים") to `apps/web`, backed by a YAML data file that is parsed and validated by a typed, pure TypeScript module. A "משתתפים" entry is added to the shared header `navLinks`, so it appears in both desktop and mobile navigation.

The main design constraint is the deploy target. `apps/web` runs on Cloudflare Workers through OpenNext, and `open-next.config.ts` uses `defineCloudflareConfig()` with defaults. Per the [OpenNext Cloudflare caching docs](https://opennext.js.org/cloudflare/caching), the default setup does not configure a real incremental cache, so a prerendered route can still be rendered by the Worker on a request. Any code on the page's render path therefore has to work inside workerd, where the project's source files don't exist on a filesystem. The design inlines the YAML text into the server bundle at compile time, so the render path never touches `fs`. That holds whether the page is served from a prerender or rendered by the Worker.

### Key decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| YAML loading | Import the `.yaml` file as a string through a 4-line local bundler loader (`loaders/raw-text-loader.cjs`), registered for both Turbopack (`next build`, the default in Next 16) and webpack (`next dev --webpack`). | The YAML text becomes a string constant in the server module graph, so no filesystem access happens at build or request time. Dev hot-reloads when the YAML is edited. No third-party loader is needed, and both bundlers share one code path. |
| Rejected: `fs.readFileSync` + `force-static` | Not used | This only works if the Worker never renders the page. With the default no-op OpenNext cache that isn't guaranteed, and workerd has no access to `src/data/contributors.yaml`. It would violate Req 3.8 on a cache miss. |
| Rejected: codegen script (YAML → JSON/TS) | Not used | It adds a pre-step to `dev`, `build`, `lint`, and `test`. The generated file would have to be committed (drift risk) or gitignored (CI ordering risk). |
| Rejected: Turbopack import attributes / `type: 'raw'` rules | Not used | Import attributes are Turbopack-only and break `next dev --webpack`. Module `type` rules are documented for newer releases and can't be relied on for `next@~16.1.6`. |
| Parse location | `parseContributors()` runs at module scope in `src/data/contributors.ts`, which only the server page imports. | During `next build`, the static prerender evaluates the module, so invalid data throws and fails the Build (Req 3.4–3.7). The client bundles never import it (Req 3.9). |
| Rendering | `export const dynamic = 'force-static'` on the page. Page and card are Server Components with no `'use client'`. | This guarantees prerendering at build time, so validation always runs during the Build. The page ships only HTML/RSC output to the browser. |
| `github` field | Accepts a username, `@username`, or a GitHub profile URL (`github.com/u`, `https://github.com/u`, `https://www.github.com/u/`). It is normalized to the bare username at parse time. | Maintainers will paste either form. Downstream code (avatar URL, profile link) only ever sees a validated username. |
| URL fields | `linkedin`, `website`, and `x` must be absolute `http(s)` URLs. `image` must be an absolute `http(s)` URL or a root-relative path under `/contributors/`. | This blocks `javascript:` and other unsafe schemes in `href`/`src` and catches typos early. It goes slightly beyond Req 3.5 and is reported with the same index + field error. |
| Unknown keys | Rejected with index + key name | A typo like `linkdin:` would otherwise silently drop a link. This also goes slightly beyond the requirements. |
| Icons | Lucide `Globe` for website. Inline SVG components for GitHub, LinkedIn, and X. | The installed `lucide-react@1.25.0` has no brand icons (checked in `node_modules/lucide-react/dist/esm/icons`: no `github`, `linkedin`, or `twitter`; `x` is the close glyph). The brand paths come from Simple Icons (CC0). |
| Images | Plain `<img>` | `next/image` on Workers needs an image loader plus remote-pattern config for `github.com`. Plain `<img>` keeps the page fully static, as Req 4.4 asks. |

## Architecture

```mermaid
flowchart LR
  subgraph Source
    Y[src/data/contributors.yaml]
  end
  subgraph Build["next build (Turbopack) / next dev (webpack)"]
    L[loaders/raw-text-loader.cjs<br/>export default &quot;...yaml text...&quot;]
    C[src/data/contributors.ts<br/>contributors = parseContributors(raw)]
    P[src/data/parse-contributors.ts<br/>yaml.parse + validate + normalize]
    D[components/contributors/contributor-display.ts<br/>getAvatarSource / getInitials / getSocialLinks]
    Page[app/contributors/page.tsx<br/>force-static Server Component]
    Card[contributor-card.tsx<br/>Server Component]
  end
  Y --> L --> C
  P --> C
  C --> Page --> Card
  D --> Card
  Page --> HTML[Prerendered HTML + RSC payload]
  HTML --> W[Cloudflare Worker via OpenNext]
```

Data flow at build time:

1. The bundler resolves `import raw from './contributors.yaml'` through the raw-text loader. The YAML becomes a string literal in the server chunk.
2. `contributors.ts` evaluates `parseContributors(raw)` once at module load. On invalid data it throws a `ContributorsValidationError`, the prerender of `/contributors` fails, and `next build` exits non-zero.
3. The page maps `contributors` to `<ContributorCard>` in file order. The pure helpers in `contributor-display.ts` derive the avatar source and social links.

At request time on Workers, the route is either served from the prerender or re-rendered from the bundled string constant. In both cases there is no `fs` access (Req 3.8). The `yaml` package lives only in the server bundle (Req 3.9).

## Components and Interfaces

### File layout

```
apps/web/
├── index.d.ts                                   (modified: declare module '*.yaml')
├── loaders/raw-text-loader.cjs                  (new)
├── next.config.js                               (modified: turbopack.rules + webpack rule)
├── package.json                                 (modified: yaml dep, fast-check devDep)
├── vite.config.mts                              (new: vitest config)
├── public/contributors/.gitkeep                 (new: home for local avatar files)
└── src/
    ├── app/contributors/page.tsx                (new)
    ├── components/contributors/
    │   ├── contributor-card.tsx                 (new)
    │   ├── contributor-display.ts               (new, pure)
    │   ├── contributor-display.spec.ts          (new)
    │   └── social-icons.tsx                     (new)
    ├── components/marketing/site-header.tsx     (modified: navLinks)
    └── data/
        ├── contributors.yaml                    (new)
        ├── contributors.ts                      (new: raw import + parse)
        ├── parse-contributors.ts                (new, pure)
        └── parse-contributors.spec.ts           (new)
```

The parser is split from the raw import so that unit tests can import `parse-contributors.ts` without needing a `.yaml` transform in Vitest.

### Bundler wiring

`apps/web/loaders/raw-text-loader.cjs`:

```js
// @ts-check
/**
 * Minimal webpack/Turbopack loader: exposes a text file as an ES module whose
 * default export is the file contents. Used for src/data/contributors.yaml so
 * the YAML is inlined into the server bundle at compile time (no fs at runtime
 * on Cloudflare Workers).
 * @param {string} source
 */
module.exports = function rawTextLoader(source) {
  return `export default ${JSON.stringify(source)};`;
};
```

`apps/web/next.config.js` additions (existing `output` and `outputFileTracingRoot` stay unchanged):

```js
const rawTextLoader = path.join(__dirname, 'loaders/raw-text-loader.cjs');

const nextConfig = {
  // ...existing options
  // `next build` uses Turbopack (Next 16 default).
  turbopack: {
    rules: {
      '*.yaml': { loaders: [rawTextLoader], as: '*.js' },
    },
  },
  // `next dev --webpack` (see package.json "dev").
  webpack: (config) => {
    config.module.rules.push({ test: /\.yaml$/, use: [rawTextLoader] });
    return config;
  },
};
```

Next 16 refuses a Turbopack build when only a `webpack` config is present. Defining `turbopack` alongside `webpack` avoids that check.

`apps/web/index.d.ts` addition:

```ts
declare module '*.yaml' {
  const content: string;
  export default content;
}
```

### Data model and parser: `src/data/parse-contributors.ts`

```ts
import { parse, YAMLParseError } from 'yaml';

export interface Contributor {
  name: string;
  image?: string;    // absolute http(s) URL or "/contributors/<file>"
  role?: string;
  github?: string;   // normalized GitHub username (no URL, no "@")
  linkedin?: string; // absolute http(s) URL
  website?: string;  // absolute http(s) URL
  x?: string;        // absolute http(s) URL
}

export const OPTIONAL_FIELDS = ['image', 'role', 'github', 'linkedin', 'website', 'x'] as const;
export type OptionalField = (typeof OPTIONAL_FIELDS)[number];
export type ContributorField = 'name' | OptionalField;

export class ContributorsValidationError extends Error {
  constructor(
    message: string,
    readonly index?: number,          // 0-based entry index, when entry-specific
    readonly field?: string,          // offending field/key, when field-specific
  ) {
    super(message);
    this.name = 'ContributorsValidationError';
  }
}

/** Parses contributors.yaml text into validated, normalized records. Throws on any problem. */
export function parseContributors(source: string): Contributor[];

/** Accepts "user", "@user", "github.com/user", "http(s)://(www.)github.com/user[/]". Returns username or null. */
export function normalizeGithubUsername(value: string): string | null;
```

Validation rules, applied in this order per entry (index `i`, 0-based):

1. Document level. Syntax errors are caught as `YAMLParseError` and rethrown as `ContributorsValidationError('contributors.yaml is not valid YAML: …')`. If the top-level value is not an array (including `null` from an empty file), it throws `'contributors.yaml must contain a list of contributors'`.
2. Entry shape. If the entry is not a plain object (it's a scalar, array, or null), it throws with `index = i`.
3. Unknown keys. Any key outside `name` + `OPTIONAL_FIELDS` throws with `index = i, field = key`.
4. `name`. It must be a string with non-whitespace content, and is trimmed. Otherwise it throws with `index = i, field = 'name'`.
5. Optional fields. If a key is present, its value must be a string with non-whitespace content, and is trimmed. Otherwise it throws with `index = i, field`. A present `null` (e.g. `role:` with no value) counts as invalid.
6. Field formats. Each failure throws with `index = i, field`:
   - `github`: `normalizeGithubUsername` must return a username matching `^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$`. Repository URLs (extra path segments) are rejected.
   - `linkedin`, `website`, `x`: `new URL(v)` must succeed with protocol `http:` or `https:`.
   - `image`: either an absolute `http(s)` URL, or a path that starts with `/contributors/` and contains no `..` segment.

Error message format (developer-facing, English): `contributors.yaml: entry at index 3, field "linkedin": must be an absolute http(s) URL`.

The returned array keeps file order. Each record contains only the keys that were present, with no `undefined`-valued keys.

### Data entry point: `src/data/contributors.ts`

```ts
import raw from './contributors.yaml';
import { parseContributors, type Contributor } from './parse-contributors';

export type { Contributor };

/**
 * Parsed once at module load. During `next build` this runs inside the static
 * prerender of /contributors, so invalid YAML fails the build.
 */
export const contributors: Contributor[] = parseContributors(raw);
```

The export shape mirrors `src/data/courses.ts` (`export const courses`).

### Seed data: `src/data/contributors.yaml`

```yaml
# Contributors shown on /contributors, in this order.
#
# Fields (only `name` is required):
#   name:     Display name (required)
#   role:     Short role/description, shown under the name
#   image:    https:// URL, or a file under apps/web/public/contributors/
#             referenced as /contributors/<file>
#             (when omitted, the GitHub avatar is used, then initials)
#   github:   GitHub username or profile URL
#   linkedin: Full LinkedIn profile URL
#   website:  Full personal website URL
#   x:        Full X profile URL
#
# Invalid entries fail `bunx nx build web` with the entry index and field name.

- name: FlipTheScript Community
  role: קהילת הקוד הפתוח מאחורי הפרויקט
  github: FlipTheScriptCommunity
  website: https://github.com/FlipTheScriptCommunity
```

Real contributor entries are added by maintainers. The seed uses the public GitHub org already linked from the header.

### Display helpers: `src/components/contributors/contributor-display.ts`

These pure functions keep the card component thin and are what the unit tests cover.

```ts
import type { Contributor } from '@/data/contributors';

export type AvatarSource =
  | { kind: 'image'; src: string }
  | { kind: 'initials'; initials: string };

/** image → GitHub avatar → initials (Req 4.1–4.3). */
export function getAvatarSource(contributor: Contributor): AvatarSource {
  if (contributor.image) return { kind: 'image', src: contributor.image };
  if (contributor.github) {
    return { kind: 'image', src: `https://github.com/${contributor.github}.png` };
  }
  return { kind: 'initials', initials: getInitials(contributor.name) };
}

/**
 * First code point of the first word, plus first code point of the last word
 * when there are 2+ words. Uppercased (no-op for Hebrew). Uses Array.from so
 * surrogate pairs aren't split.
 */
export function getInitials(name: string): string;

export type SocialPlatform = 'github' | 'linkedin' | 'website' | 'x';

export interface SocialLink {
  platform: SocialPlatform;
  href: string;
  label: string; // Hebrew aria-label
}

/** Fixed display order, independent of YAML key order. */
export const SOCIAL_PLATFORMS: readonly SocialPlatform[] = ['github', 'linkedin', 'website', 'x'];

export function getSocialLinks(contributor: Contributor): SocialLink[];
```

`getSocialLinks` mapping (Req 5.3–5.7, 5.9). Each label ends with "(נפתח בכרטיסייה חדשה)" to announce the `target="_blank"` behavior.

| Platform | `href` | `label` |
| --- | --- | --- |
| github | `https://github.com/${github}` | `הפרופיל של ${name} ב-GitHub (נפתח בכרטיסייה חדשה)` |
| linkedin | `linkedin` value | `הפרופיל של ${name} ב-LinkedIn (נפתח בכרטיסייה חדשה)` |
| website | `website` value | `האתר האישי של ${name} (נפתח בכרטיסייה חדשה)` |
| x | `x` value | `הפרופיל של ${name} ב-X (נפתח בכרטיסייה חדשה)` |

### Icons: `src/components/contributors/social-icons.tsx`

- `GitHubIcon`, `LinkedInIcon`, and `XIcon` are inline `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">` components that take `className`. They use Simple Icons path data (CC0), noted in a file comment.
- The website icon is `Globe` from `lucide-react`, with `aria-hidden`.
- A `SOCIAL_ICONS: Record<SocialPlatform, ComponentType<{ className?: string }>>` map is exported for the card.

### Card: `src/components/contributors/contributor-card.tsx` (Server Component)

```tsx
import type { Contributor } from '@/data/contributors';
import { getAvatarSource, getSocialLinks } from './contributor-display';
import { SOCIAL_ICONS } from './social-icons';

const AVATAR_BORDERS = ['border-secondary', 'border-accent-purple'] as const; // #2A8BF2 / #8E44AD
const LINK_BACKGROUNDS = {
  github: 'bg-accent-purple',
  linkedin: 'bg-secondary',
  website: 'bg-secondary',
  x: 'bg-accent-purple',
} as const;

export function ContributorCard({ contributor, index }: { contributor: Contributor; index: number }) {
  const avatar = getAvatarSource(contributor);
  const links = getSocialLinks(contributor);
  const border = AVATAR_BORDERS[index % AVATAR_BORDERS.length];
  const circle = `size-24 rounded-full border-[3px] ${border}`;

  return (
    <article className="flex h-full flex-col items-center rounded-xl border border-border bg-card p-6 text-center transition-colors hover:border-primary">
      {avatar.kind === 'image' ? (
        <img src={avatar.src} alt={contributor.name} width={96} height={96}
             loading="lazy" decoding="async" className={`${circle} object-cover`} />
      ) : (
        <div aria-hidden="true" className={`${circle} flex items-center justify-center bg-muted text-2xl font-bold`}>
          {avatar.initials}
        </div>
      )}
      <h2 className="mt-4 text-lg font-bold">{contributor.name}</h2>
      {contributor.role && <p className="mt-1 text-sm text-muted-foreground">{contributor.role}</p>}
      {links.length > 0 && (
        <ul className="mt-4 flex flex-wrap justify-center gap-3">
          {links.map((link) => {
            const Icon = SOCIAL_ICONS[link.platform];
            return (
              <li key={link.platform}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}
                   className={`inline-flex size-9 items-center justify-center rounded-full ${LINK_BACKGROUNDS[link.platform]} text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`}>
                  <Icon className="size-4" />
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
```

Notes:

- The card is an `<article>`, not a `Link` like the course cards. A clickable card containing several anchors would produce nested interactive content.
- The Initials_Fallback is `aria-hidden` because the name is rendered right below it as the `h2`.
- Icon backgrounds use only blue `#2A8BF2` (white contrast about 3.5:1) and purple `#8E44AD` (about 5.9:1). Teal `#20B2AA` is allowed by the guidelines but gives only about 2.6:1 against white, below the WCAG 1.4.11 non-text minimum of 3:1, so it is left out.
- If `@next/next/no-img-element` turns out to be active in lint, add a scoped `eslint-disable-next-line` with a one-line justification (static Workers deploy, no image optimizer). Today the web eslint config only registers the Next plugin.

### Page: `src/app/contributors/page.tsx`

```tsx
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { ContributorCard } from '@/components/contributors/contributor-card';
import { contributors } from '@/data/contributors';

export const dynamic = 'force-static';

export const metadata = {
  title: 'משתתפים | FlipTheScript Labs',
};

export default function ContributorsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-4xl px-6 pt-20 pb-8 text-center">
          <h1 className="text-4xl font-black text-balance sm:text-5xl">משתתפים</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-balance">
            האנשים שבונים את FlipTheScript Labs ומשתפים את הידע שלהם עם הקהילה.
          </p>
        </section>
        <section className="mx-auto max-w-6xl px-6 py-16">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contributors.map((contributor, index) => (
              <li key={`${index}-${contributor.name}`}>
                <ContributorCard contributor={contributor} index={index} />
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
```

RTL and Hebrew come from the root layout (`<html lang="he" dir="rtl">`) (Req 2.7). The hero and grid classes are copied from `courses/page.tsx` (Req 2.4, 2.6).

### Header: `src/components/marketing/site-header.tsx`

Insert `{ label: 'משתתפים', href: '/contributors' }` right after the `קורסים` entry. The href starts with `/`, so both the desktop `<nav>` and the mobile dropdown render it through `next/link`, and the mobile `onClick` closes the menu (Req 1.1–1.3). No other changes are needed.

### Dependencies

- `yaml`: added to `apps/web` `dependencies` at an exact version (`bun add -E yaml` in `apps/web`). It is bundled into the Worker's server code only.
- `fast-check`: added to `apps/web` `devDependencies` at an exact version, for property tests.
- `vitest`, `vite`, and `@vitest/coverage-v8` already exist at the repo root (`vitest ~4.1.0`). Nothing new is needed.

### Test setup: `apps/web/vite.config.mts`

This mirrors `apps/api/vite.config.mts`, so the `@nx/vitest` plugin in `nx.json` infers `test` and `test-ci` targets for the web project automatically. The existing CI step `bunx nx run-many -t lint typecheck test build` then picks it up.

```ts
/// <reference types='vitest' />
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/web',
  resolve: {
    alias: { '@': new URL('./src', import.meta.url).pathname },
  },
  test: {
    name: '@flipthescript-academy/web',
    watch: false,
    globals: false,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
```

- Specs are co-located `.spec.ts` files that import from `vitest` explicitly (`globals: false`). `apps/web/tsconfig.json` already excludes `src/**/*.spec.ts`, so `next build`'s type check never sees test-only types, and no `tsconfig.spec.json` has to be added to the non-solution-style web tsconfig.
- The `@` alias is only needed because `contributor-display.ts` imports the `Contributor` type via `@/data/contributors`. It is a type-only import and erased at transform time, but the alias keeps resolution consistent if that changes.
- Tests never import `contributors.ts` (the `.yaml` import), so Vitest needs no YAML transform. The committed YAML is still validated in tests by reading it with `node:fs` (tests run in Node, not on Workers).

## Data Models

`Contributor` (output of `parseContributors`):

| Field | Type | Required | Constraints after parsing |
| --- | --- | --- | --- |
| `name` | `string` | yes | Trimmed, non-empty |
| `role` | `string` | no | Trimmed, non-empty |
| `image` | `string` | no | `http(s)://…` URL, or `/contributors/<path>` with no `..` |
| `github` | `string` | no | Normalized GitHub username (1–39 chars, alphanumeric or single inner hyphens) |
| `linkedin` | `string` | no | Absolute `http(s)` URL |
| `website` | `string` | no | Absolute `http(s)` URL |
| `x` | `string` | no | Absolute `http(s)` URL |

Derived view models: `AvatarSource` and `SocialLink`, described in Components above.

## Error Handling

All data errors surface at build time. The page has no runtime error paths.

| Condition | Where detected | Result |
| --- | --- | --- |
| YAML syntax error | `parseContributors` (wraps `YAMLParseError`) | `ContributorsValidationError` with the parser's line/column message, build fails |
| Top-level not a list (incl. empty file) | `parseContributors` | Error "must contain a list of contributors", build fails |
| Entry not a mapping | `parseContributors` | Error with `index`, build fails |
| Unknown key | `parseContributors` | Error with `index` + `field = key`, build fails |
| Missing/empty/non-string `name` | `parseContributors` | Error with `index` + `field = 'name'`, build fails (Req 3.4) |
| Optional field present but empty/whitespace/non-string/null | `parseContributors` | Error with `index` + `field`, build fails (Req 3.5) |
| Malformed `github` / non-http(s) URL / bad `image` path | `parseContributors` | Error with `index` + `field`, build fails |
| Empty list `[]` | n/a | Valid. The page renders the hero and an empty grid. |
| Remote image or GitHub avatar fails to load in the browser | Browser | The browser shows the broken image with `alt` = name. A client-side `onError` fallback to initials is out of scope, since it would need a Client Component and isn't required. |

Failure propagation: `contributors.ts` throws at module evaluation. Next's static prerender of `/contributors` reports the error with the message above and `next build` exits non-zero (Req 3.4–3.6). The same throw shows up as an error overlay in `next dev`.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Parse round trip preserves entries and order

*For any* list of valid contributor records (random names including Hebrew and multi-word strings, with random subsets of valid optional fields), serializing the list with `yaml.stringify` and passing the result to `parseContributors` returns a list of the same length, in the same order. Each record deep-equals its input with string values trimmed, `github` in normalized username form, and absent optional fields absent from the output.

**Validates: Requirements 2.5, 3.3**

### Property 2: Invalid entries are reported with their location

*For any* list of valid contributor records, any insertion index `i`, and any field `f` in `{name, image, role, github, linkedin, website, x}` paired with an invalid value for `f` (for `name`: missing, non-string, empty, or whitespace-only; for optional fields: present but non-string, null, empty, or whitespace-only), inserting an otherwise-valid entry with that invalid `f` at index `i` makes `parseContributors` throw a `ContributorsValidationError` whose `index` is `i` and whose `field` is `f`.

**Validates: Requirements 3.4, 3.5**

### Property 3: Non-list documents are rejected

*For any* YAML document whose top-level value is not a sequence (null, boolean, number, string, or mapping), `parseContributors` throws a `ContributorsValidationError`.

**Validates: Requirements 3.6**

### Property 4: GitHub username normalization

*For any* valid GitHub username `u`, `normalizeGithubUsername` returns `u` for each accepted form (`u`, `@u`, `github.com/u`, `https://github.com/u`, `http://www.github.com/u/`). *For any* string `s` for which it returns a username `v`, `normalizeGithubUsername(v)` also returns `v` (idempotence).

**Validates: Requirements 3.3, 4.2, 5.3**

### Property 5: Avatar source precedence

*For any* valid contributor, `getAvatarSource` returns `{ kind: 'image', src: image }` when `image` is present, regardless of `github`. Otherwise it returns `{ kind: 'image', src: 'https://github.com/<github>.png' }` when `github` is present, and `{ kind: 'initials' }` when neither is present.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 6: Initials are derived from the name

*For any* name containing at least one non-whitespace character, `getInitials` returns 1 or 2 code points. The first is the uppercased first code point of the first whitespace-separated word. When the name has two or more words, the second is the uppercased first code point of the last word.

**Validates: Requirements 4.3**

### Property 7: Social links match exactly the present fields

*For any* valid contributor, `getSocialLinks` returns one link per present field among `github`, `linkedin`, `website`, `x` and no others, ordered `github, linkedin, website, x`. The GitHub link's `href` is `https://github.com/<github>`, and every other link's `href` equals its field value.

**Validates: Requirements 5.3, 5.4, 5.5, 5.6, 5.7**

### Property 8: Social link labels name the platform and the contributor

*For any* valid contributor and every link returned by `getSocialLinks`, the `label` contains the contributor's `name` and the platform's display name (`GitHub`, `LinkedIn`, `האתר האישי`, `X`).

**Validates: Requirements 5.9**

## Testing Strategy

### Property-based tests

- Library: `fast-check` (pinned) with Vitest. Each property runs at least 100 iterations (`fc.assert(fc.property(...), { numRuns: 100 })`).
- Each test is tagged with a comment `// Feature: contributors-page, Property N: <property title>`.
- Shared generators live in the spec files:
  - `validUsername` builds strings from the GitHub username grammar.
  - `validUrl` builds `https://` URLs from `fc.webUrl({ validSchemes: ['https'] })`.
  - `validImage` picks either a URL or `/contributors/<segment>.<ext>`.
  - `validName` draws mixed Latin/Hebrew words joined by spaces, with optional surrounding whitespace.
  - `validContributor` uses `fc.record` with `requiredKeys: ['name']`.
- `parse-contributors.spec.ts` covers Properties 1–4. `contributor-display.spec.ts` covers Properties 5–8.

### Example-based unit tests

`parse-contributors.spec.ts`:

- The committed `src/data/contributors.yaml` (read via `node:fs`) parses without error and has at least one entry. This gives early warning before the Build (Req 3.1, 6.3).
- A name-only entry returns `{ name }` with no other keys (Req 6.1).
- A fully populated entry returns all fields (Req 6.1).
- Malformed YAML (e.g. `- name: [unclosed`) throws `ContributorsValidationError` (Req 3.6).
- An unknown key (`linkdin`) throws with `field: 'linkdin'`.
- `website: javascript:alert(1)` throws with `field: 'website'`.
- `image: ../secret.png` and `image: /other/x.png` throw with `field: 'image'`.
- `github: https://github.com/user/repo` throws with `field: 'github'`.

`contributor-display.spec.ts`:

- One explicit example each for image, GitHub fallback, and initials (Req 6.2).
- Initials for a Hebrew two-word name (e.g. "דנה כהן" → "דכ").

### Build, lint, and manual verification

- `bunx nx test web` (and `test-ci`) passes.
- `bunx nx build web` succeeds, and `/contributors` is listed as a static (○) route (Req 2.1, 3.7, 6.3). To check the failure path, temporarily set an entry's `name` to `""`. The build should fail with the index in the message (Req 3.4). Then revert.
- Client bundle check (Req 3.9): after the build, searching `apps/web/.next/static` for the `yaml` library's error strings (e.g. `Implicit map keys need to be followed by map values`) and for the YAML header comment text returns no matches.
- `bunx nx lint web` passes with no new errors. The web project has no inferred `typecheck` target, so `next build`'s built-in TypeScript check is the type gate for app code (Req 6.4).
- `bunx nx preview web` (workerd) serves `/contributors` with cards rendered (Req 3.8). Check the "משתתפים" link at desktop and mobile widths, the RTL layout, `target`/`rel` on links (Req 5.8), `alt` on avatars (Req 4.4), and the visual styling (Req 2.4, 2.6, 4.5, 5.10).

Full WCAG validation needs manual testing with assistive technologies. The checks above cover labels, alt text, and contrast choices only.
