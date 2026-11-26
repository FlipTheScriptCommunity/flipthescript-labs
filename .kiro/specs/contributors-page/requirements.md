# Requirements Document

## Introduction

This feature adds a Contributors page ("משתתפים") to the FlipTheScript Labs web app (`apps/web`). The page lists project contributors, each shown with a picture and optional links to LinkedIn, GitHub, a personal website, and X. Contributor data is maintained in a YAML file (`apps/web/src/data/contributors.yaml`) that is read and validated at build time by a static server component, so the page works on Cloudflare Workers via OpenNext with no runtime filesystem access and no client-side YAML parsing. A navigation link labeled "משתתפים" is added to the shared site header so the page is reachable from the home page and every other page. The page follows the existing RTL Hebrew UI, the layout conventions of the courses page, and the FlipTheScript design guidelines.

## Glossary

- **Web_App**: The Next.js application in `apps/web`, deployed to Cloudflare Workers via OpenNext.
- **Contributors_Page**: The statically rendered page served at the `/contributors` route of the Web_App.
- **Site_Header**: The shared header component in `apps/web/src/components/marketing/site-header.tsx`, whose `navLinks` array feeds both the desktop and mobile navigation.
- **Contributors_File**: The YAML file at `apps/web/src/data/contributors.yaml` that is the single source of contributor data.
- **Contributors_Loader**: The typed build-time module, located alongside the Contributors_File, that parses and validates the Contributors_File and returns a typed list of Contributor_Entry records.
- **Contributor_Entry**: One contributor record in the Contributors_File, with the required field `name` and the optional fields `image`, `role`, `github`, `linkedin`, `website`, and `x`.
- **Contributor_Card**: The visual element on the Contributors_Page that displays one Contributor_Entry.
- **Avatar**: The circular picture shown on a Contributor_Card.
- **GitHub_Avatar_URL**: The URL `https://github.com/<github>.png`, where `<github>` is the value of the Contributor_Entry `github` field.
- **Initials_Fallback**: A circular element showing the initials derived from the Contributor_Entry `name` field, used when no picture source is available.
- **Social_Link**: An external link on a Contributor_Card to GitHub, LinkedIn, a personal website, or X, rendered as an icon.
- **Build**: The production build of the Web_App, run with `bunx nx build web`.

## Requirements

### Requirement 1: Navigation link to the Contributors page

**User Story:** As a site visitor, I want a "משתתפים" link in the site navigation, so that I can reach the Contributors page from the home page and any other page.

#### Acceptance Criteria

1. THE Site_Header SHALL include a navigation link with the label "משתתפים" and the destination `/contributors` in the `navLinks` array.
2. THE Site_Header SHALL render the "משתתפים" navigation link in both the desktop navigation and the mobile navigation.
3. WHEN a visitor activates the "משתתפים" navigation link, THE Web_App SHALL display the Contributors_Page.

### Requirement 2: Contributors page structure

**User Story:** As a site visitor, I want a Contributors page that looks consistent with the rest of the site, so that the experience feels coherent.

#### Acceptance Criteria

1. THE Web_App SHALL serve the Contributors_Page at the `/contributors` route.
2. THE Contributors_Page SHALL set the document title to "משתתפים | FlipTheScript Labs".
3. THE Contributors_Page SHALL render the Site_Header at the top of the page and the site footer at the bottom of the page.
4. THE Contributors_Page SHALL render a hero section containing an `h1` heading with the text "משתתפים" and a muted subtitle, styled consistently with the hero section of the courses page.
5. THE Contributors_Page SHALL render one Contributor_Card for each Contributor_Entry in the Contributors_File, in the order the entries appear in the Contributors_File.
6. THE Contributors_Page SHALL arrange Contributor_Cards in a responsive grid using the card styling of the courses page (rounded border, card background, primary-colored border on hover).
7. THE Contributors_Page SHALL render in right-to-left (RTL) direction with Hebrew UI text.

### Requirement 3: Contributor data source and validation

**User Story:** As a maintainer, I want contributors defined in a validated YAML file, so that I can add or edit contributors without touching page code and catch mistakes before deployment.

#### Acceptance Criteria

1. THE Contributors_Loader SHALL read contributor data exclusively from the Contributors_File.
2. THE Contributors_Loader SHALL parse the Contributors_File using the `yaml` npm package, added to the Web_App dependencies with a pinned exact version.
3. THE Contributors_Loader SHALL return each Contributor_Entry as a typed record containing the required field `name` and the optional fields `image`, `role`, `github`, `linkedin`, `website`, and `x`.
4. IF the Contributors_File contains a Contributor_Entry without a non-empty string `name` field, THEN THE Contributors_Loader SHALL throw an error that identifies the index of the invalid Contributor_Entry and causes the Build to fail.
5. IF a Contributor_Entry contains an optional field whose value is present and is not a non-empty string, THEN THE Contributors_Loader SHALL throw an error that identifies the index of the Contributor_Entry and the invalid field name, and causes the Build to fail.
6. IF the Contributors_File content is not valid YAML or the top-level value is not a list, THEN THE Contributors_Loader SHALL throw an error that causes the Build to fail.
7. WHEN the Build runs, THE Contributors_Page SHALL obtain contributor data from the Contributors_Loader during static rendering.
8. THE Web_App SHALL serve the Contributors_Page without reading the filesystem at request time on Cloudflare Workers.
9. THE Web_App SHALL deliver contributor data to the browser as pre-rendered HTML, without shipping the YAML parser or the Contributors_File to client-side JavaScript bundles.

### Requirement 4: Contributor picture

**User Story:** As a site visitor, I want to see a picture for each contributor, so that I can recognize the people behind the project.

#### Acceptance Criteria

1. WHERE a Contributor_Entry has an `image` field, THE Contributor_Card SHALL display the Avatar using the `image` value as the picture source, supporting both absolute URLs and paths to files under `apps/web/public/contributors/`.
2. WHERE a Contributor_Entry has no `image` field and has a `github` field, THE Contributor_Card SHALL display the Avatar using the GitHub_Avatar_URL as the picture source.
3. WHERE a Contributor_Entry has neither an `image` field nor a `github` field, THE Contributor_Card SHALL display the Initials_Fallback in place of the Avatar.
4. THE Contributor_Card SHALL render the Avatar as a standard `img` element with an `alt` attribute containing the Contributor_Entry `name`.
5. THE Contributor_Card SHALL render the Avatar and the Initials_Fallback as circles with a solid border in the brand blue (#2A8BF2) or brand purple, per the FlipTheScript design guidelines.

### Requirement 5: Contributor details and social links

**User Story:** As a site visitor, I want each contributor's name, role, and available profile links, so that I can learn more about and connect with them.

#### Acceptance Criteria

1. THE Contributor_Card SHALL display the Contributor_Entry `name`.
2. WHERE a Contributor_Entry has a `role` field, THE Contributor_Card SHALL display the `role` value below the `name`.
3. WHERE a Contributor_Entry has a `github` field, THE Contributor_Card SHALL render a GitHub Social_Link pointing to `https://github.com/<github>`.
4. WHERE a Contributor_Entry has a `linkedin` field, THE Contributor_Card SHALL render a LinkedIn Social_Link pointing to the `linkedin` value.
5. WHERE a Contributor_Entry has a `website` field, THE Contributor_Card SHALL render a website Social_Link pointing to the `website` value.
6. WHERE a Contributor_Entry has an `x` field, THE Contributor_Card SHALL render an X Social_Link pointing to the `x` value.
7. WHEN a Contributor_Entry omits the `github`, `linkedin`, `website`, or `x` field, THE Contributor_Card SHALL render only the Social_Links whose corresponding fields are present.
8. THE Contributor_Card SHALL render each Social_Link with `target="_blank"` and `rel="noopener noreferrer"`.
9. THE Contributor_Card SHALL give each Social_Link an accessible Hebrew label that names the destination platform and the Contributor_Entry `name`.
10. THE Contributor_Card SHALL render each Social_Link icon as a flat white icon on a colored circular background, per the FlipTheScript design guidelines.

### Requirement 6: Verification

**User Story:** As a maintainer, I want the contributor loader covered by automated tests and the app to pass existing checks, so that changes to contributor data or code are safe.

#### Acceptance Criteria

1. THE Web_App SHALL include automated unit tests for the Contributors_Loader that cover valid entries, entries with only the `name` field, a missing `name` field, an invalid optional field value, and a non-list top-level value.
2. THE Web_App SHALL include automated unit tests for the Avatar source selection that cover the `image` field, the GitHub_Avatar_URL fallback, and the Initials_Fallback.
3. WHEN the Build runs with a valid Contributors_File, THE Build SHALL complete successfully.
4. WHEN lint and typecheck run across all projects, THE Web_App SHALL pass both checks with no new errors.
