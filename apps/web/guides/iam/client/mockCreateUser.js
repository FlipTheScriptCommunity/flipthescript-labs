import {
  ACCOUNT_ID,
  CHANGE_PASSWORD_POLICY,
  EXISTING_USERS,
  SIGN_IN_URL,
  getExistingUser,
} from './data';

// Same rules the real IAM console enforces for a user name.
export function validateUserName(name) {
  if (!name) return 'User name is required.';
  if (name.length > 64) return 'User name must be 64 characters or fewer.';
  if (!/^[\w+=,.@-]+$/.test(name)) {
    return 'User name can only contain alphanumeric characters and +=,.@-_';
  }
  if (EXISTING_USERS.some((u) => u.name.toLowerCase() === name.toLowerCase())) {
    return `A user with the name ${name} already exists in this account. User names are not case sensitive.`;
  }
  return null;
}

// The account's default password policy: at least 8 characters and at
// least three of the four character types.
export function validatePassword(password) {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (password.length > 128) return 'Password must be 128 characters or fewer.';
  const types = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) =>
    re.test(password),
  ).length;
  if (types < 3) {
    return 'Password must include at least three of the following: uppercase letters, lowercase letters, numbers, and symbols.';
  }
  return null;
}

const randomFrom = (alphabet, length) =>
  Array.from(
    { length },
    () => alphabet[Math.floor(Math.random() * alphabet.length)],
  ).join('');

function generatePassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*()_+-=[]{}|';
  // Guarantee all four character types, then shuffle.
  const chars = (
    randomFrom(upper, 4) +
    randomFrom(lower, 5) +
    randomFrom(digits, 3) +
    randomFrom(symbols, 2)
  ).split('');
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

// What the user will end up with: group memberships plus directly attached
// policies. Shared by the review step and the mock "create" call.
export function plannedPermissions(form) {
  let policies = [];
  let groups = [];
  if (form.permissionsOption === 'attach') {
    policies = [...form.selectedPolicies];
  } else if (form.permissionsOption === 'groups') {
    groups = [...form.selectedGroups];
  } else if (form.permissionsOption === 'copy') {
    const source = getExistingUser(form.copyFrom);
    if (!source) {
      return {
        policies,
        groups,
        error: 'Choose a user to copy permissions from.',
      };
    }
    policies = [...source.policies];
    groups = [...source.groups];
  }
  // Like the real console: a user who must reset their password at first
  // sign-in automatically gets the policy that lets them do it.
  if (
    form.consoleAccess &&
    form.requireReset &&
    !policies.includes(CHANGE_PASSWORD_POLICY)
  ) {
    policies.push(CHANGE_PASSWORD_POLICY);
  }
  return { policies, groups, error: null };
}

export function mockCreateUser(form) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const nameError = validateUserName(form.userName);
      if (nameError) {
        reject(new Error(nameError));
        return;
      }
      if (form.consoleAccess && form.passwordType === 'custom') {
        const passwordError = validatePassword(form.customPassword);
        if (passwordError) {
          reject(new Error(passwordError));
          return;
        }
      }

      const plan = plannedPermissions(form);
      if (plan.error) {
        reject(new Error(plan.error));
        return;
      }
      const { policies, groups } = plan;

      resolve({
        userName: form.userName,
        userId: `AIDA${randomFrom('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567', 17)}`,
        arn: `arn:aws:iam::${ACCOUNT_ID}:user/${form.userName}`,
        createdAt: new Date().toISOString(),
        consoleAccess: form.consoleAccess,
        password: form.consoleAccess
          ? form.passwordType === 'custom'
            ? form.customPassword
            : generatePassword()
          : null,
        requireReset: form.consoleAccess && form.requireReset,
        signInUrl: SIGN_IN_URL,
        policies,
        groups,
        tags: form.tags.filter((tag) => tag.key.trim()),
      });
    }, 800);
  });
}
