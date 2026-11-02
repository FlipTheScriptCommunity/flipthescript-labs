import { getGroup, getPolicy } from './data';

// A deliberately small version of IAM's policy evaluation logic, enough to
// teach the core rule: an action is allowed only if some attached policy
// has an Allow statement that matches it — otherwise it's implicitly
// denied. (None of the policies in this lab use Deny statements, so the
// "explicit deny always wins" rule never comes into play here.)

const patternCache = new Map();

// IAM action patterns are case-insensitive and support * and ? wildcards.
function toRegex(pattern) {
  if (!patternCache.has(pattern)) {
    const escaped = pattern
      .split('')
      .map((ch) => {
        if (ch === '*') return '.*';
        if (ch === '?') return '.';
        return ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
      })
      .join('');
    patternCache.set(pattern, new RegExp(`^${escaped}$`, 'i'));
  }
  return patternCache.get(pattern);
}

export const actionMatches = (pattern, action) => toRegex(pattern).test(action);

function statementAllows(statement, action) {
  if (statement.effect !== 'Allow') return false;
  if (statement.action) {
    return statement.action.some((pattern) => actionMatches(pattern, action));
  }
  if (statement.notAction) {
    return !statement.notAction.some((pattern) =>
      actionMatches(pattern, action),
    );
  }
  return false;
}

// Every policy that applies to the user: attached directly, or inherited
// from a group the user belongs to.
export function effectivePolicies(user) {
  const direct = user.policies.map((name) => ({
    name,
    attachedVia: 'Directly',
  }));
  const fromGroups = user.groups.flatMap((groupName) =>
    (getGroup(groupName)?.policies || []).map((name) => ({
      name,
      attachedVia: `Group ${groupName}`,
    })),
  );
  return [...direct, ...fromGroups];
}

export function simulate(user, actions) {
  const policies = effectivePolicies(user);
  return actions.map((action) => {
    const match = policies.find(({ name }) =>
      (getPolicy(name)?.statements || []).some((statement) =>
        statementAllows(statement, action),
      ),
    );
    return {
      action,
      decision: match ? 'allowed' : 'implicitDeny',
      matchedPolicy: match ? match.name : null,
      attachedVia: match ? match.attachedVia : null,
    };
  });
}
