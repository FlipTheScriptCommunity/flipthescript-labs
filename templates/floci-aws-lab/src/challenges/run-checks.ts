import { errorMessage } from '../lib/aws';
import type { Challenge, CheckContext, CheckResult } from './types';

// Runs every task's check in order. A check that throws something unexpected
// (Floci down, a network error) is reported as a failed task with the raw
// error, rather than aborting the whole run.
export async function runChecks(
  challenge: Challenge,
  ctx: CheckContext,
): Promise<Record<string, CheckResult>> {
  const results: Record<string, CheckResult> = {};
  for (const task of challenge.tasks) {
    try {
      results[task.id] = await task.check(ctx);
    } catch (err) {
      const message = errorMessage(err);
      results[task.id] = {
        ok: false,
        message: {
          he: `הבדיקה נכשלה: ${message}`,
          en: `The check failed: ${message}`,
        },
      };
    }
  }
  return results;
}

export const isComplete = (
  challenge: Challenge,
  results: Record<string, CheckResult> | undefined,
) => !!results && challenge.tasks.every((task) => results[task.id]?.ok);
