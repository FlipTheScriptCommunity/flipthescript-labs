import type { LambdaClient } from '@aws-sdk/client-lambda';
import type { S3Client } from '@aws-sdk/client-s3';
import type { Localized } from '../lib/i18n';

export interface CheckContext {
  s3: Pick<S3Client, 'send'>;
  lambda: Pick<LambdaClient, 'send'>;
}

export interface CheckResult {
  ok: boolean;
  message: Localized;
}

export interface ChallengeTask {
  id: string;
  title: Localized;
  hint: Localized;
  /** Optional code shown under the hint (language-neutral). */
  snippet?: string;
  /**
   * Inspects the student's Floci resources and reports whether this task is
   * done. Runs against the same S3/Lambda APIs the console uses — the check
   * looks at real state, not at which buttons were clicked.
   */
  check: (ctx: CheckContext) => Promise<CheckResult>;
}

export interface Challenge {
  id: string;
  title: Localized;
  summary: Localized;
  /** What the student should understand by the end (shown as "What you'll learn"). */
  objectives: Localized<string[]>;
  /** Where the challenge starts in the console. */
  startHref: string;
  tasks: ChallengeTask[];
}
