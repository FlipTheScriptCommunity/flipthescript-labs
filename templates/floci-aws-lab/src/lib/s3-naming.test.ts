import { describe, expect, it } from 'vitest';
import { validateBucketName } from './s3-naming';

describe('validateBucketName', () => {
  it.each(['fts-lab-data', 'abc', 'my.bucket.1', 'a'.repeat(63)])(
    'accepts %s',
    (name) => {
      expect(validateBucketName(name)).toBeNull();
    },
  );

  it.each([
    ['ab', 'between 3 and 63'],
    ['a'.repeat(64), 'between 3 and 63'],
    ['My-Bucket', 'lowercase'],
    ['my_bucket', 'lowercase'],
    ['-bucket', 'begin and end'],
    ['bucket.', 'begin and end'],
    ['my..bucket', 'adjacent periods'],
    ['192.168.5.4', 'IP address'],
  ])('rejects %s', (name, reason) => {
    expect(validateBucketName(name)).toContain(reason);
  });
});
