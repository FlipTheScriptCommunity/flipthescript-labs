// Static reference data for the Lambda lab. Everything here is a teaching
// mock except one thing: the function code really runs — in a Web Worker in
// the student's browser (see runtime.js). That's why only the Node.js
// runtimes can be chosen.

export const REGION = 'us-east-1';
export const ACCOUNT_ID = '123456789012';

const BROWSER_ONLY =
  'Not available in this lab — only Node.js code can run in your browser';

export const RUNTIMES = [
  { value: 'nodejs22.x', label: 'Node.js 22.x' },
  { value: 'nodejs20.x', label: 'Node.js 20.x' },
  { value: 'python3.13', label: 'Python 3.13', disabled: true },
  { value: 'python3.12', label: 'Python 3.12', disabled: true },
  { value: 'java21', label: 'Java 21', disabled: true },
  { value: 'dotnet8', label: '.NET 8 (C#/F#/PowerShell)', disabled: true },
  { value: 'ruby3.3', label: 'Ruby 3.3', disabled: true },
].map((runtime) =>
  runtime.disabled ? { ...runtime, description: BROWSER_ONLY } : runtime,
);

export const getRuntime = (value) => RUNTIMES.find((r) => r.value === value);

export const EXISTING_ROLES = ['service-role/lambda-basic-execution'];

// The exact starter code the real console creates for a Node.js function.
export const DEFAULT_CODE = `export const handler = async (event) => {
  // TODO implement
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};
`;

// The real console's "hello-world" test event template.
export const DEFAULT_EVENT = `{
  "key1": "value1",
  "key2": "value2",
  "key3": "value3"
}`;

export const MEMORY_LIMITS = { min: 128, max: 10240 };
export const TIMEOUT_LIMITS = { min: 1, max: 900 };
