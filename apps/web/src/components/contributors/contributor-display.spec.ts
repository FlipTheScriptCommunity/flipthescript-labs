import { describe, expect, it } from 'vitest';
import type { Contributor } from '@/data/parse-contributors';
import {
  getAvatarSource,
  getInitials,
  getSocialLinks,
} from './contributor-display';

describe('getAvatarSource', () => {
  it('uses the image field when present', () => {
    expect(
      getAvatarSource({ name: 'Ada', image: '/contributors/ada.png' }),
    ).toEqual({ kind: 'image', src: '/contributors/ada.png' });
  });

  it('falls back to the GitHub avatar when image is absent', () => {
    expect(getAvatarSource({ name: 'Ada', github: 'octocat' })).toEqual({
      kind: 'image',
      src: 'https://github.com/octocat.png',
    });
  });

  it('falls back to initials when neither image nor github is present', () => {
    expect(getAvatarSource({ name: 'Ada Lovelace' })).toEqual({
      kind: 'initials',
      initials: 'AL',
    });
  });

  it('prefers image over github when both are present', () => {
    expect(
      getAvatarSource({
        name: 'Ada',
        image: 'https://example.com/ada.jpg',
        github: 'octocat',
      }),
    ).toEqual({ kind: 'image', src: 'https://example.com/ada.jpg' });
  });
});

describe('getInitials', () => {
  it('takes the first letter of the first and last word of a Hebrew name', () => {
    expect(getInitials('דנה כהן')).toBe('דכ');
  });

  it('returns a single initial for a single-word name', () => {
    expect(getInitials('ada')).toBe('A');
  });
});

describe('getSocialLinks', () => {
  it('returns links in fixed order with the expected hrefs', () => {
    const contributor: Contributor = {
      name: 'Ada',
      // Deliberately not in display order.
      x: 'https://x.com/ada',
      website: 'https://ada.dev',
      linkedin: 'https://www.linkedin.com/in/ada',
      github: 'octocat',
    };

    const links = getSocialLinks(contributor);

    expect(links.map(({ platform, href }) => ({ platform, href }))).toEqual([
      { platform: 'github', href: 'https://github.com/octocat' },
      { platform: 'linkedin', href: 'https://www.linkedin.com/in/ada' },
      { platform: 'website', href: 'https://ada.dev' },
      { platform: 'x', href: 'https://x.com/ada' },
    ]);
  });

  it('returns an empty array when no social fields are present', () => {
    expect(
      getSocialLinks({
        name: 'Ada',
        role: 'Maintainer',
        image: '/contributors/ada.png',
      }),
    ).toEqual([]);
  });
});
