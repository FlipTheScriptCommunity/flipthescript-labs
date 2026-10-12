import { strFromU8, unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { buildLambdaZip, formatBytes } from './zip';

describe('buildLambdaZip', () => {
  it('produces a zip holding the source under the given file name', () => {
    const files = unzipSync(
      buildLambdaZip('index.mjs', 'export const handler = async () => 1;'),
    );
    expect(Object.keys(files)).toEqual(['index.mjs']);
    expect(strFromU8(files['index.mjs'])).toBe(
      'export const handler = async () => 1;',
    );
  });
});

describe('formatBytes', () => {
  it('formats sizes', () => {
    expect(formatBytes(undefined)).toBe('-');
    expect(formatBytes(14)).toBe('14 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
  });
});
