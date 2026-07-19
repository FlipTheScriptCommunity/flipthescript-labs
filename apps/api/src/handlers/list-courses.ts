import type { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDocumentClient } from '@flipthescript-academy/dynamo-client';
import type { Course } from '@flipthescript-academy/shared-types';

const TABLE_NAME = process.env['COURSES_TABLE_NAME'] ?? '';

export const handler: APIGatewayProxyHandler =
  async (): Promise<APIGatewayProxyResult> => {
    const result = await dynamoDocumentClient.send(
      new ScanCommand({ TableName: TABLE_NAME }),
    );

    const courses = (result.Items ?? []) as Course[];

    return {
      statusCode: 200,
      body: JSON.stringify(courses),
    };
  };
