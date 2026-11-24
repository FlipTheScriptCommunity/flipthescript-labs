import { useState } from 'react';
import { lambda, s3 } from '../lib/aws';
import { renderBidi } from '../lib/bidi';
import { dirOf, useLanguage, type Lang } from '../lib/i18n';
import { LanguageToggle } from '../tutorial/LanguageToggle';
import { isComplete, runChecks } from './run-checks';
import type { Challenge, CheckResult } from './types';

const UI = {
  he: {
    challenge: 'אתגר',
    learn: 'מה תלמדו',
    tasks: 'משימות',
    hint: 'רמז',
    check: 'בדקו את העבודה שלי',
    checking: 'בודק...',
    tutorial: 'הדרכה מודרכת',
    complete: 'השלמתם את האתגר! 🎉',
    completeBody: 'כל המשימות עברו בהצלחה. אפשר להמשיך לאתגר הבא.',
    next: 'לאתגר הבא',
    pick: 'בחרו אתגר',
  },
  en: {
    challenge: 'Challenge',
    learn: "What you'll learn",
    tasks: 'Tasks',
    hint: 'Hint',
    check: 'Check my work',
    checking: 'Checking...',
    tutorial: 'Guided tutorial',
    complete: 'Challenge complete! 🎉',
    completeBody: 'Every task passed. You can move on to the next challenge.',
    next: 'Next challenge',
    pick: 'Choose a challenge',
  },
} satisfies Record<Lang, Record<string, string>>;

interface ChallengePanelProps {
  challenges: Challenge[];
  active: Challenge;
  onSelect: (challenge: Challenge) => void;
  onStartTutorial: () => void;
  /** Check results per challenge id — owned by the caller so they survive the panel closing. */
  results: Record<string, Record<string, CheckResult>>;
  onResults: (
    challengeId: string,
    results: Record<string, CheckResult>,
  ) => void;
}

// The FlipTheScript teaching layer that sits beside the simulated console (in
// Cloudscape's tools panel): the challenge's goals, its tasks, and a "Check my
// work" button that inspects the student's actual Floci resources.
//
// Results live in memory only — progress tracking comes in a later phase.
export function ChallengePanel({
  challenges,
  active,
  onSelect,
  onStartTutorial,
  results,
  onResults,
}: ChallengePanelProps) {
  const { lang } = useLanguage();
  const t = UI[lang];
  const [checking, setChecking] = useState(false);
  const [openHints, setOpenHints] = useState<Record<string, boolean>>({});

  const current = results[active.id];
  const done = isComplete(active, current);
  const nextChallenge = challenges[challenges.indexOf(active) + 1];

  const check = async () => {
    setChecking(true);
    try {
      onResults(active.id, await runChecks(active, { s3, lambda }));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div
      id="challenge-panel"
      className="challenge-panel fts-font"
      dir={dirOf(lang)}
    >
      <div className="fts-panel-header">
        <label className="challenge-picker">
          <span className="visually-hidden">{t.pick}</span>
          <select
            value={active.id}
            onChange={(event) => {
              const next = challenges.find((c) => c.id === event.target.value);
              if (next) onSelect(next);
            }}
          >
            {challenges.map((challenge, i) => (
              <option key={challenge.id} value={challenge.id}>
                {`${t.challenge} ${i + 1}`}
              </option>
            ))}
          </select>
        </label>
        <LanguageToggle />
      </div>

      <h2 className="challenge-title">{renderBidi(active.title[lang])}</h2>
      <p className="challenge-summary">{renderBidi(active.summary[lang])}</p>

      <h3 className="challenge-section">{t.learn}</h3>
      <ul className="challenge-objectives">
        {active.objectives[lang].map((objective) => (
          <li key={objective}>{renderBidi(objective)}</li>
        ))}
      </ul>

      <h3 className="challenge-section">{t.tasks}</h3>
      <ol className="challenge-tasks">
        {active.tasks.map((task) => {
          const result = current?.[task.id];
          const state = result ? (result.ok ? 'pass' : 'fail') : 'todo';
          return (
            <li
              key={task.id}
              className={`challenge-task challenge-task-${state}`}
            >
              <div className="challenge-task-row">
                <span className="challenge-task-icon" aria-hidden>
                  {state === 'pass' ? '✓' : state === 'fail' ? '✗' : '○'}
                </span>
                <span className="challenge-task-title">
                  {renderBidi(task.title[lang])}
                </span>
              </div>
              {result && (
                <div className="challenge-task-result">
                  {renderBidi(result.message[lang])}
                </div>
              )}
              <button
                type="button"
                className="challenge-hint-toggle"
                aria-expanded={!!openHints[task.id]}
                onClick={() =>
                  setOpenHints((prev) => ({
                    ...prev,
                    [task.id]: !prev[task.id],
                  }))
                }
              >
                {openHints[task.id] ? '▾' : '▸'} {t.hint}
              </button>
              {openHints[task.id] && (
                <div className="challenge-hint">
                  <p>{renderBidi(task.hint[lang])}</p>
                  {task.snippet && (
                    <pre className="challenge-snippet" dir="ltr">
                      {task.snippet}
                    </pre>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {done && (
        <div className="challenge-complete" role="status">
          <strong>{t.complete}</strong>
          <p>{t.completeBody}</p>
          {nextChallenge && (
            <button
              type="button"
              className="fts-btn-primary"
              onClick={() => onSelect(nextChallenge)}
            >
              {t.next}
            </button>
          )}
        </div>
      )}

      <div className="fts-panel-actions">
        <button
          type="button"
          className="fts-btn-secondary"
          onClick={onStartTutorial}
        >
          {t.tutorial}
        </button>
        <span id="btn-check-work">
          <button
            type="button"
            className="fts-btn-primary"
            onClick={check}
            disabled={checking}
          >
            {checking ? t.checking : t.check}
          </button>
        </span>
      </div>
    </div>
  );
}
