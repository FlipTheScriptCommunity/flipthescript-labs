import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ContributorsValidationError,
  parseContributors,
} from './parse-contributors';

/** Runs parseContributors and returns the thrown ContributorsValidationError. */
function captureError(source: string): ContributorsValidationError {
  try {
    parseContributors(source);
  } catch (error) {
    expect(error).toBeInstanceOf(ContributorsValidationError);
    return error as ContributorsValidationError;
  }
  throw new Error('expected parseContributors to throw');
}

/** YAML with a valid entry at index 0 followed by `entry` at index 1. */
function withSecondEntry(entry: string): string {
  return `- name: Valid Person\n- ${entry}\n`;
}

describe('parseContributors', () => {
  describe('committed contributors.yaml', () => {
    it('parses without error and has at least one entry', () => {
      // Read the real data file directly (tests never import contributors.ts).
      const source = readFileSync(
        new URL('./contributors.yaml', import.meta.url),
        'utf8',
      );
      const result = parseContributors(source);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('valid entries', () => {
    it('returns only { name } for a name-only entry', () => {
      const result = parseContributors('- name: דנה כהן\n');
      expect(result).toEqual([{ name: 'דנה כהן' }]);
      expect(Object.keys(result[0])).toEqual(['name']);
    });

    it('returns all fields for a fully populated entry', () => {
      const source = [
        '- name: "  Ada Lovelace  "',
        '  role: Engineer',
        '  image: /contributors/ada.png',
        '  github: https://github.com/ada-l',
        '  linkedin: https://www.linkedin.com/in/ada',
        '  website: https://ada.example.com',
        '  x: https://x.com/ada',
      ].join('\n');

      expect(parseContributors(source)).toEqual([
        {
          name: 'Ada Lovelace',
          role: 'Engineer',
          image: '/contributors/ada.png',
          github: 'ada-l',
          linkedin: 'https://www.linkedin.com/in/ada',
          website: 'https://ada.example.com',
          x: 'https://x.com/ada',
        },
      ]);
    });

    it('keeps file order across multiple entries', () => {
      const result = parseContributors('- name: First\n- name: Second\n');
      expect(result.map((c) => c.name)).toEqual(['First', 'Second']);
    });

    it('accepts an absolute image URL and @-prefixed GitHub username', () => {
      const result = parseContributors(
        '- name: A\n  image: https://example.com/a.png\n  github: "@octocat"\n',
      );
      expect(result).toEqual([
        { name: 'A', image: 'https://example.com/a.png', github: 'octocat' },
      ]);
    });
  });

  describe('invalid name', () => {
    it.each([
      ['missing', 'role: Engineer'],
      ['empty', 'name: ""'],
      ['whitespace-only', 'name: "   "'],
      ['non-string', 'name: 42'],
    ])('throws for a %s name with index and field', (_label, entry) => {
      const error = captureError(withSecondEntry(entry));
      expect(error.index).toBe(1);
      expect(error.field).toBe('name');
      expect(error.message).toContain('index 1');
    });
  });

  describe('invalid optional values', () => {
    it.each([
      ['empty string', 'role', 'role: ""'],
      ['null', 'role', 'role:'],
      ['non-string', 'role', 'role: 42'],
      ['whitespace-only', 'linkedin', 'linkedin: "  "'],
      ['list value', 'x', 'x: [a, b]'],
    ])('throws for a %s %s with index and field', (_label, field, line) => {
      const error = captureError(withSecondEntry(`name: Someone\n  ${line}`));
      expect(error.index).toBe(1);
      expect(error.field).toBe(field);
      expect(error.message).toContain(`field "${field}"`);
    });
  });

  describe('invalid documents', () => {
    it.each([
      ['a mapping', 'name: Someone\n'],
      ['a scalar', 'just a string\n'],
      ['a number', '42\n'],
      ['an empty file', ''],
    ])('throws when the top-level value is %s', (_label, source) => {
      const error = captureError(source);
      expect(error.message).toContain('must contain a list');
      expect(error.index).toBeUndefined();
    });

    it('throws for malformed YAML', () => {
      const error = captureError('- name: [unclosed');
      expect(error.message).toContain('not valid YAML');
    });

    it('throws with the index when an entry is not a mapping', () => {
      const error = captureError(withSecondEntry('just a string'));
      expect(error.index).toBe(1);
      expect(error.field).toBeUndefined();
    });
  });

  describe('unknown keys and field formats', () => {
    it.each([
      ['unknown key', 'linkdin', 'linkdin: https://linkedin.com/in/a'],
      ['javascript: website', 'website', 'website: javascript:alert(1)'],
      ['relative image path', 'image', 'image: ../secret.png'],
      ['image outside /contributors/', 'image', 'image: /other/x.png'],
      ['image with .. segment', 'image', 'image: /contributors/../secret.png'],
      ['GitHub repository URL', 'github', 'github: https://github.com/user/repo'],
      ['invalid GitHub username', 'github', 'github: bad_name!'],
      ['non-URL linkedin', 'linkedin', 'linkedin: linkedin.com/in/a'],
      ['ftp x URL', 'x', 'x: ftp://x.com/a'],
    ])('throws for %s with field "%s"', (_label, field, line) => {
      const error = captureError(withSecondEntry(`name: Someone\n  ${line}`));
      expect(error.index).toBe(1);
      expect(error.field).toBe(field);
    });
  });
});
