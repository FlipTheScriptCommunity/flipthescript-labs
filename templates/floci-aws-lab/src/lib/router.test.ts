import { describe, expect, it } from 'vitest';
import { href, parseRoute } from './router';

describe('parseRoute', () => {
  it('maps the empty hash to home', () => {
    expect(parseRoute('')).toEqual({ page: 'home' });
    expect(parseRoute('#/')).toEqual({ page: 'home' });
  });

  it('round-trips every href builder', () => {
    expect(parseRoute(href.buckets())).toEqual({ page: 's3-buckets' });
    expect(parseRoute(href.createBucket())).toEqual({
      page: 's3-create-bucket',
    });
    expect(parseRoute(href.bucket('fts-lab-data'))).toEqual({
      page: 's3-bucket',
      bucket: 'fts-lab-data',
    });
    expect(parseRoute(href.functions())).toEqual({ page: 'lambda-functions' });
    expect(parseRoute(href.createFunction())).toEqual({
      page: 'lambda-create-function',
    });
    expect(parseRoute(href.fn('read-s3-object'))).toEqual({
      page: 'lambda-function',
      functionName: 'read-s3-object',
    });
  });

  it('accepts service roots and trailing slashes', () => {
    expect(parseRoute('#/s3')).toEqual({ page: 's3-buckets' });
    expect(parseRoute('#/lambda/')).toEqual({ page: 'lambda-functions' });
  });

  it('reports malformed percent-encoding as not-found', () => {
    expect(parseRoute('#/s3/buckets/%')).toEqual({
      page: 'not-found',
      path: '/s3/buckets/%',
    });
  });

  it('reports unknown paths', () => {
    expect(parseRoute('#/ec2')).toEqual({ page: 'not-found', path: '/ec2' });
  });
});
