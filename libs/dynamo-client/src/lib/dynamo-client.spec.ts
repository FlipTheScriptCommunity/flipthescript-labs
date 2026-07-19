import { describe, expect, it } from 'vitest';
import { dynamoDocumentClient } from './dynamo-client.js';

describe('dynamoDocumentClient', () => {
  it('is instantiated', () => {
    expect(dynamoDocumentClient).toBeDefined();
  });
});
