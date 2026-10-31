import { parse, YAMLParseError } from 'yaml';

/**
 * One validated, normalized record from `contributors.yaml`. Only keys that
 * were present in the file are set; absent optional fields are omitted.
 */
export interface Contributor {
  name: string;
  /** Absolute http(s) URL or "/contributors/<file>" (under apps/web/public). */
  image?: string;
  role?: string;
  /** Normalized GitHub username (no URL, no "@"). */
  github?: string;
  /** Absolute http(s) URL. */
  linkedin?: string;
  /** Absolute http(s) URL. */
  website?: string;
  /** Absolute http(s) URL. */
  x?: string;
}

export const OPTIONAL_FIELDS = [
  'image',
  'role',
  'github',
  'linkedin',
  'website',
  'x',
] as const;
export type OptionalField = (typeof OPTIONAL_FIELDS)[number];
export type ContributorField = 'name' | OptionalField;

export class ContributorsValidationError extends Error {
  /** 0-based entry index, when the error is entry-specific. */
  readonly index?: number;
  /** Offending field/key, when the error is field-specific. */
  readonly field?: string;

  constructor(message: string, index?: number, field?: string) {
    super(message);
    this.name = 'ContributorsValidationError';
    if (index !== undefined) this.index = index;
    if (field !== undefined) this.field = field;
  }
}

const KNOWN_FIELDS: ReadonlySet<string> = new Set<string>([
  'name',
  ...OPTIONAL_FIELDS,
]);

const URL_FIELDS: ReadonlySet<OptionalField> = new Set<OptionalField>([
  'linkedin',
  'website',
  'x',
]);

const GITHUB_USERNAME_RE =
  /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;

// "github.com/u", "http(s)://github.com/u", "http(s)://www.github.com/u/".
// A single path segment only, so repository URLs (".../u/repo") don't match.
const GITHUB_PROFILE_URL_RE =
  /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#\s]+)\/?$/i;

const IMAGE_PATH_PREFIX = '/contributors/';

/**
 * Accepts "user", "@user", "github.com/user", and
 * "http(s)://(www.)github.com/user[/]". Returns the bare username, or null if
 * the value isn't one of those forms or the username is not valid.
 */
export function normalizeGithubUsername(value: string): string | null {
  const trimmed = value.trim();
  let candidate: string;

  const urlMatch = GITHUB_PROFILE_URL_RE.exec(trimmed);
  if (urlMatch) {
    candidate = urlMatch[1];
  } else if (trimmed.startsWith('@')) {
    candidate = trimmed.slice(1);
  } else {
    candidate = trimmed;
  }

  return GITHUB_USERNAME_RE.test(candidate) ? candidate : null;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidImage(value: string): boolean {
  if (isHttpUrl(value)) return true;
  if (!value.startsWith(IMAGE_PATH_PREFIX)) return false;
  const rest = value.slice(IMAGE_PATH_PREFIX.length);
  if (rest.length === 0) return false;
  return !rest.split(/[/\\]/).some((segment) => segment === '..');
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function fieldError(
  index: number,
  field: string,
  reason: string,
): ContributorsValidationError {
  return new ContributorsValidationError(
    `contributors.yaml: entry at index ${index}, field "${field}": ${reason}`,
    index,
    field,
  );
}

/** Returns the trimmed value if it's a string with non-whitespace content. */
function nonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseEntry(entry: unknown, index: number): Contributor {
  // 1. Entry shape.
  if (!isPlainObject(entry)) {
    throw new ContributorsValidationError(
      `contributors.yaml: entry at index ${index}: must be a mapping of fields (e.g. "name: ...")`,
      index,
    );
  }

  // 2. Unknown keys.
  for (const key of Object.keys(entry)) {
    if (!KNOWN_FIELDS.has(key)) {
      throw fieldError(
        index,
        key,
        `unknown field (allowed: name, ${OPTIONAL_FIELDS.join(', ')})`,
      );
    }
  }

  // 3. Required name.
  const name = nonEmptyString(entry['name']);
  if (name === null) {
    throw fieldError(
      index,
      'name',
      'is required and must be a non-empty string',
    );
  }

  const contributor: Contributor = { name };

  // 4. Present optional fields must be non-empty strings; 5. format checks.
  for (const field of OPTIONAL_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(entry, field)) continue;

    const value = nonEmptyString(entry[field]);
    if (value === null) {
      throw fieldError(index, field, 'must be a non-empty string when present');
    }

    if (field === 'github') {
      const username = normalizeGithubUsername(value);
      if (username === null) {
        throw fieldError(
          index,
          field,
          'must be a GitHub username or profile URL (e.g. "octocat" or "https://github.com/octocat")',
        );
      }
      contributor.github = username;
    } else if (URL_FIELDS.has(field)) {
      if (!isHttpUrl(value)) {
        throw fieldError(index, field, 'must be an absolute http(s) URL');
      }
      contributor[field] = value;
    } else if (field === 'image') {
      if (!isValidImage(value)) {
        throw fieldError(
          index,
          field,
          `must be an absolute http(s) URL or a path under "${IMAGE_PATH_PREFIX}" without ".." segments`,
        );
      }
      contributor.image = value;
    } else {
      contributor[field] = value;
    }
  }

  return contributor;
}

/**
 * Parses contributors.yaml text into validated, normalized records, in file
 * order. Throws a ContributorsValidationError on any problem.
 */
export function parseContributors(source: string): Contributor[] {
  let data: unknown;
  try {
    data = parse(source);
  } catch (error) {
    if (error instanceof YAMLParseError) {
      throw new ContributorsValidationError(
        `contributors.yaml is not valid YAML: ${error.message}`,
      );
    }
    throw error;
  }

  if (!Array.isArray(data)) {
    throw new ContributorsValidationError(
      'contributors.yaml must contain a list of contributors',
    );
  }

  return data.map((entry: unknown, index) => parseEntry(entry, index));
}
