import { ACCOUNT_ID, DEFAULT_CODE, REGION, getRuntime } from './data';

// Same rules the real Lambda console enforces for a function name.
export function validateFunctionName(name) {
  if (!name) return 'Function name is required.';
  if (name.length > 64) return 'Function name must be 1 to 64 characters.';
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    return "Function name can only contain letters, numbers, hyphens (-), and underscores (_), and can't include spaces.";
  }
  return null;
}

const randomString = (alphabet, length) =>
  Array.from(
    { length },
    () => alphabet[Math.floor(Math.random() * alphabet.length)],
  ).join('');

const LOWER_ALNUM = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function mockCreateFunction(form) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const nameError = validateFunctionName(form.name);
      if (nameError) {
        reject(new Error(nameError));
        return;
      }

      const roleName =
        form.roleMode === 'create'
          ? `${form.name}-role-${randomString(LOWER_ALNUM, 8)}`
          : form.existingRole;

      resolve({
        name: form.name,
        arn: `arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${form.name}`,
        region: REGION,
        runtime: getRuntime(form.runtime),
        architecture: form.architecture,
        handler: 'index.handler',
        roleName,
        roleArn: `arn:aws:iam::${ACCOUNT_ID}:role/${roleName.startsWith('service-role/') ? roleName : `service-role/${roleName}`}`,
        logGroup: `/aws/lambda/${form.name}`,
        memory: 128,
        timeout: 3,
        ephemeralStorage: 512,
        functionUrl: form.functionUrl
          ? {
              url: `https://${randomString(LOWER_ALNUM, 32)}.lambda-url.${REGION}.on.aws/`,
              authType: form.functionUrlAuth,
            }
          : null,
        code: DEFAULT_CODE,
        lastModified: new Date().toISOString(),
      });
    }, 900);
  });
}
