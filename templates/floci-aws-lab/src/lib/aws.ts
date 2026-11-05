import { S3Client } from '@aws-sdk/client-s3';
import { LambdaClient } from '@aws-sdk/client-lambda';

// The real AWS SDK, pointed at this page's own origin. The dev server forwards
// every SigV4-signed request to Floci (see vite/floci-proxy.ts), so these are
// genuine S3/Lambda API calls — just served by a local emulator.
//
// The credentials are Floci's dummy ones; nothing here can reach a real AWS
// account.
export const REGION = 'us-east-1';
export const ACCOUNT_ID = '000000000000';

const base = {
  region: REGION,
  endpoint:
    typeof window === 'undefined'
      ? 'http://localhost:5173'
      : window.location.origin,
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
};

export const s3 = new S3Client({
  ...base,
  // Path-style (<origin>/<bucket>/<key>) — virtual-hosted style would need a
  // DNS name per bucket, which a Codespace forwarded URL can't provide.
  forcePathStyle: true,
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});

export const lambda = new LambdaClient(base);

// Floci accepts any role ARN; real AWS would need an IAM role that trusts
// lambda.amazonaws.com and grants the function its permissions.
export const DEFAULT_LAMBDA_ROLE = `arn:aws:iam::${ACCOUNT_ID}:role/lab-lambda-role`;

export function errorMessage(err: unknown): string {
  if (err instanceof Error)
    return err.name && err.name !== 'Error'
      ? `${err.name}: ${err.message}`
      : err.message;
  return String(err);
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
