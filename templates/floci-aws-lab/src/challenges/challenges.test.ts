import { describe, expect, it } from 'vitest';
import { stripBidi } from '../lib/bidi';
import {
  CHALLENGES,
  LAB_BUCKET,
  LAB_FUNCTION,
  LAB_OBJECT_KEY,
} from './challenges';
import { isComplete, runChecks } from './run-checks';
import type { CheckContext } from './types';

// A fake account: just enough of S3 and Lambda for the checks, keyed off the
// SDK command class names.
interface FakeState {
  buckets: Record<string, Record<string, string>>;
  functions: Record<
    string,
    { runtime: string; handler: (body: string | undefined) => unknown }
  >;
}

const notFound = (name = 'NotFound') =>
  Object.assign(new Error(name), { name });

function fakeContext(state: FakeState): CheckContext {
  const s3 = {
    send: async (command: {
      constructor: { name: string };
      input: { Bucket: string; Key?: string };
    }) => {
      const { Bucket, Key } = command.input;
      const bucket = state.buckets[Bucket];
      switch (command.constructor.name) {
        case 'HeadBucketCommand':
          if (!bucket) throw notFound();
          return {};
        case 'HeadObjectCommand':
          if (!bucket || bucket[Key ?? ''] === undefined) throw notFound();
          return { ContentLength: bucket[Key ?? ''].length };
        case 'GetObjectCommand':
          if (!bucket || bucket[Key ?? ''] === undefined)
            throw notFound('NoSuchKey');
          return { Body: { transformToString: async () => bucket[Key ?? ''] } };
      }
      throw new Error(`unexpected ${command.constructor.name}`);
    },
  };
  const lambda = {
    send: async (command: {
      constructor: { name: string };
      input: { FunctionName: string };
    }) => {
      const fn = state.functions[command.input.FunctionName];
      if (!fn) throw notFound('ResourceNotFoundException');
      switch (command.constructor.name) {
        case 'GetFunctionCommand':
          return { Configuration: { Runtime: fn.runtime } };
        case 'InvokeCommand':
          try {
            const out = fn.handler(state.buckets[LAB_BUCKET]?.[LAB_OBJECT_KEY]);
            return {
              StatusCode: 200,
              Payload: new TextEncoder().encode(JSON.stringify(out)),
            };
          } catch (err) {
            return {
              StatusCode: 200,
              FunctionError: 'Unhandled',
              Payload: new TextEncoder().encode(
                JSON.stringify({ errorMessage: (err as Error).message }),
              ),
            };
          }
      }
      throw new Error(`unexpected ${command.constructor.name}`);
    },
  };
  return { s3, lambda } as unknown as CheckContext;
}

const [s3Challenge, lambdaChallenge] = CHALLENGES;

describe('S3 challenge', () => {
  it('fails every task on an empty account', async () => {
    const results = await runChecks(
      s3Challenge,
      fakeContext({ buckets: {}, functions: {} }),
    );
    expect(Object.values(results).map((r) => r.ok)).toEqual([false, false]);
    expect(stripBidi(results['create-bucket'].message.he)).toContain(
      LAB_BUCKET,
    );
  });

  it('rejects an empty hello.txt', async () => {
    const results = await runChecks(
      s3Challenge,
      fakeContext({
        buckets: { [LAB_BUCKET]: { [LAB_OBJECT_KEY]: '' } },
        functions: {},
      }),
    );
    expect(results['create-bucket'].ok).toBe(true);
    expect(results['upload-object'].ok).toBe(false);
    expect(results['upload-object'].message.en).toContain('empty');
  });

  it('passes once the bucket holds hello.txt', async () => {
    const results = await runChecks(
      s3Challenge,
      fakeContext({
        buckets: { [LAB_BUCKET]: { [LAB_OBJECT_KEY]: 'Hello!' } },
        functions: {},
      }),
    );
    expect(isComplete(s3Challenge, results)).toBe(true);
  });
});

describe('Lambda challenge', () => {
  const buckets = { [LAB_BUCKET]: { [LAB_OBJECT_KEY]: 'Hello from S3!' } };

  it('fails when the function still returns the starter response', async () => {
    const results = await runChecks(
      lambdaChallenge,
      fakeContext({
        buckets,
        functions: {
          [LAB_FUNCTION]: {
            runtime: 'nodejs22.x',
            handler: () => ({ message: 'Hello from Lambda!' }),
          },
        },
      }),
    );
    expect(results['create-function'].ok).toBe(true);
    expect(results['read-object'].ok).toBe(false);
    expect(results['read-object'].message.en).toContain('Deploy');
  });

  it('reports the runtime error when the function throws', async () => {
    const results = await runChecks(
      lambdaChallenge,
      fakeContext({
        buckets,
        functions: {
          [LAB_FUNCTION]: {
            runtime: 'nodejs22.x',
            handler: () => {
              throw new Error('AccessDenied');
            },
          },
        },
      }),
    );
    expect(results['read-object'].ok).toBe(false);
    expect(results['read-object'].message.en).toContain('AccessDenied');
  });

  it('rejects a non-Node.js runtime', async () => {
    const results = await runChecks(
      lambdaChallenge,
      fakeContext({
        buckets,
        functions: {
          [LAB_FUNCTION]: { runtime: 'python3.12', handler: (b) => b },
        },
      }),
    );
    expect(results['create-function'].ok).toBe(false);
  });

  it.each([
    ['a bare string', (body: string | undefined) => body],
    ['an object field', (body: string | undefined) => ({ content: body })],
  ])('passes when the file content is returned as %s', async (_, handler) => {
    const results = await runChecks(
      lambdaChallenge,
      fakeContext({
        buckets,
        functions: { [LAB_FUNCTION]: { runtime: 'nodejs22.x', handler } },
      }),
    );
    expect(isComplete(lambdaChallenge, results)).toBe(true);
  });

  it('points back to the S3 challenge when hello.txt is missing', async () => {
    const results = await runChecks(
      lambdaChallenge,
      fakeContext({
        buckets: {},
        functions: {
          [LAB_FUNCTION]: { runtime: 'nodejs22.x', handler: () => 'x' },
        },
      }),
    );
    expect(results['read-object'].message.en).toContain('previous challenge');
  });
});
