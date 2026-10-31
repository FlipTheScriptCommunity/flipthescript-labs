// Pure display helpers for contributor cards. Type-only import keeps the
// YAML-backed `@/data/contributors` module out of the runtime graph here.
import type { Contributor } from '@/data/contributors';

export type AvatarSource =
  | { kind: 'image'; src: string }
  | { kind: 'initials'; initials: string };

/** image → GitHub avatar → initials (Req 4.1–4.3). */
export function getAvatarSource(contributor: Contributor): AvatarSource {
  if (contributor.image) return { kind: 'image', src: contributor.image };
  if (contributor.github) {
    return {
      kind: 'image',
      src: `https://github.com/${contributor.github}.png`,
    };
  }
  return { kind: 'initials', initials: getInitials(contributor.name) };
}

/**
 * First code point of the first word, plus first code point of the last word
 * when there are 2+ words. Uppercased (no-op for Hebrew). Uses Array.from so
 * surrogate pairs aren't split.
 */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';

  const firstCodePoint = (word: string): string =>
    (Array.from(word)[0] ?? '').toUpperCase();

  const first = firstCodePoint(words[0]);
  if (words.length === 1) return first;
  return first + firstCodePoint(words[words.length - 1]);
}

export type SocialPlatform = 'github' | 'linkedin' | 'website' | 'x';

export interface SocialLink {
  platform: SocialPlatform;
  href: string;
  label: string; // Hebrew aria-label
}

/** Fixed display order, independent of YAML key order. */
export const SOCIAL_PLATFORMS: readonly SocialPlatform[] = [
  'github',
  'linkedin',
  'website',
  'x',
];

const NEW_TAB_SUFFIX = '(נפתח בכרטיסייה חדשה)';

const SOCIAL_LINK_BUILDERS: Record<
  SocialPlatform,
  (value: string, name: string) => Omit<SocialLink, 'platform'>
> = {
  github: (value, name) => ({
    href: `https://github.com/${value}`,
    label: `הפרופיל של ${name} ב-GitHub ${NEW_TAB_SUFFIX}`,
  }),
  linkedin: (value, name) => ({
    href: value,
    label: `הפרופיל של ${name} ב-LinkedIn ${NEW_TAB_SUFFIX}`,
  }),
  website: (value, name) => ({
    href: value,
    label: `האתר האישי של ${name} ${NEW_TAB_SUFFIX}`,
  }),
  x: (value, name) => ({
    href: value,
    label: `הפרופיל של ${name} ב-X ${NEW_TAB_SUFFIX}`,
  }),
};

/** One link per present social field, in SOCIAL_PLATFORMS order (Req 5.3–5.7, 5.9). */
export function getSocialLinks(contributor: Contributor): SocialLink[] {
  const links: SocialLink[] = [];
  for (const platform of SOCIAL_PLATFORMS) {
    const value = contributor[platform];
    if (!value) continue;
    links.push({
      platform,
      ...SOCIAL_LINK_BUILDERS[platform](value, contributor.name),
    });
  }
  return links;
}
