import { describe, expect, it } from 'vitest';
import { handler } from './health.js';

describe('health handler', () => {
  it('returns a 200 status', async () => {
    const result = await handler({} as never, {} as never, undefined as never);
    expect(result?.statusCode).toBe(200);
  });
});
