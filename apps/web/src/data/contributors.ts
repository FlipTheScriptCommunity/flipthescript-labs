import raw from './contributors.yaml';
import { parseContributors, type Contributor } from './parse-contributors';

export type { Contributor };

/**
 * Parsed once at module load. During `next build` this runs inside the static
 * prerender of /contributors, so invalid YAML fails the build.
 */
export const contributors: Contributor[] = parseContributors(raw);
