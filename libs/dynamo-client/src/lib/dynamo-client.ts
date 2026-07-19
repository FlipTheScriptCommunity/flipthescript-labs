import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Reused across Lambda invocations within the same execution environment.
const client = new DynamoDBClient({
  region: process.env['AWS_REGION'] ?? 'us-east-1',
});

export const dynamoDocumentClient = DynamoDBDocumentClient.from(client);
