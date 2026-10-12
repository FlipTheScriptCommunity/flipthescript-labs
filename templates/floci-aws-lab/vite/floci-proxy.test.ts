import { describe, expect, it } from 'vitest';
import { LAMBDA_CODE_PREFIX, flociPath } from './floci-proxy';
import { LAMBDA_CODE_PREFIX as CLIENT_PREFIX } from '../src/services/lambda/lambda-helpers';

describe('flociPath', () => {
  it('forwards SigV4-signed SDK requests unchanged', () => {
    const headers = {
      authorization:
        'AWS4-HMAC-SHA256 Credential=test/20260923/us-east-1/s3/aws4_request',
    };
    expect(flociPath({ url: '/', headers })).toBe('/');
    expect(flociPath({ url: '/fts-lab-data/hello.txt', headers })).toBe(
      '/fts-lab-data/hello.txt',
    );
  });

  it('forwards JSON-protocol requests and Floci endpoints', () => {
    expect(
      flociPath({
        url: '/',
        headers: { 'x-amz-target': 'Logs_20140328.DescribeLogGroups' },
      }),
    ).toBe('/');
    expect(flociPath({ url: '/_localstack/health', headers: {} })).toBe(
      '/_localstack/health',
    );
  });

  it('strips the Lambda code download prefix', () => {
    expect(
      flociPath({
        url: `${LAMBDA_CODE_PREFIX}/awslambda-us-east-1-tasks/snapshots/000000000000/fn`,
        headers: {},
      }),
    ).toBe('/awslambda-us-east-1-tasks/snapshots/000000000000/fn');
  });

  it('leaves page and asset requests to Vite', () => {
    expect(flociPath({ url: '/', headers: {} })).toBeNull();
    expect(flociPath({ url: '/src/main.tsx', headers: {} })).toBeNull();
  });

  it('agrees with the client on the code download prefix', () => {
    expect(CLIENT_PREFIX).toBe(LAMBDA_CODE_PREFIX);
  });
});
