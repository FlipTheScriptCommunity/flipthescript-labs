import {
  GetFunctionCommand,
  type FunctionConfiguration,
} from '@aws-sdk/client-lambda';
import { lambda, sleep } from '../../lib/aws';

export const RUNTIMES = [
  { value: 'nodejs22.x', label: 'Node.js 22.x' },
  { value: 'nodejs20.x', label: 'Node.js 20.x' },
];

// Node.js runtimes load index.mjs as an ES module, so `import`/`export` work
// without a package.json. The handler string is "<file>.<exported function>".
export const CODE_FILE = 'index.mjs';
export const HANDLER = 'index.handler';

// Must match LAMBDA_CODE_PREFIX in vite/floci-proxy.ts.
export const LAMBDA_CODE_PREFIX = '/_lab/lambda-code';

export const STARTER_CODE = `// index.mjs — your function's code.
// Lambda calls the exported "handler" once for every invocation, passing the
// event that triggered it. Whatever it returns is the invocation's response.
export const handler = async (event) => {
  console.log('Received event:', JSON.stringify(event));

  return {
    message: 'Hello from Lambda!',
  };
};
`;

// Creating or updating a function is asynchronous in Lambda: the call returns
// while the function is still Pending / InProgress, and invoking it too early
// fails. Poll until it's ready, like the console's own spinner does.
export async function waitForFunctionReady(
  functionName: string,
  timeoutMs = 30_000,
): Promise<FunctionConfiguration> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const { Configuration } = await lambda.send(
      new GetFunctionCommand({ FunctionName: functionName }),
    );
    if (Configuration?.State === 'Failed')
      throw new Error(
        `"${functionName}" failed to become active: ${Configuration.StateReason ?? Configuration.StateReasonCode ?? 'unknown reason'}`,
      );
    if (Configuration?.LastUpdateStatus === 'Failed')
      throw new Error(
        `Update of "${functionName}" failed: ${Configuration.LastUpdateStatusReason ?? Configuration.LastUpdateStatusReasonCode ?? 'unknown reason'}`,
      );
    const pending =
      Configuration?.State === 'Pending' ||
      Configuration?.LastUpdateStatus === 'InProgress';
    if (Configuration && !pending) return Configuration;
    if (Date.now() > deadline)
      throw new Error(
        `Timed out waiting for "${functionName}" to become ready.`,
      );
    await sleep(500);
  }
}

export function prettyPayload(payload: Uint8Array | undefined): string {
  if (!payload || payload.length === 0) return '';
  const text = new TextDecoder().decode(payload);
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}
