import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Modal from '@cloudscape-design/components/modal';
import { renderBidi } from '../lib/bidi';
import { dirOf, useLanguage } from '../lib/i18n';
import { navigate } from '../lib/router';
import { LanguageToggle } from './LanguageToggle';
import { TUTORIAL_UI, type TutorialContent } from './tutorials';
import type { Lang } from '../lib/i18n';

interface TutorialOverlayProps {
  content: Record<Lang, TutorialContent>;
  onExit: () => void;
  /** Called when a step targets something that has to be opened first (e.g. the challenge panel). */
  onReveal?: (targetId: string) => void;
}

// Ported from the EC2 lab's TutorialOverlay.jsx, plus two things a multi-page
// lab needs: steps can navigate (`route`), and a step whose target isn't in
// the DOM yet keeps polling for it instead of spotlighting nothing.
//
// It's rendered through a portal to document.body so it sits above
// Cloudscape's AppLayout regardless of its stacking contexts. The spotlight has
// pointer-events: none, so the console underneath stays fully clickable —
// students do each step themselves while the panel explains it.
export function TutorialOverlay({
  content,
  onExit,
  onReveal,
}: TutorialOverlayProps) {
  const { lang } = useLanguage();
  const ui = TUTORIAL_UI[lang];
  const { welcome, steps } = content[lang];
  const dir = dirOf(lang);

  const [showWelcome, setShowWelcome] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  // Navigate when entering a step that belongs to another page.
  useEffect(() => {
    if (showWelcome) return;
    if (step.route) navigate(step.route);
    onReveal?.(step.targetId);
  }, [showWelcome, step, onReveal]);

  const updateRect = useCallback(() => {
    const el = document.getElementById(step.targetId);
    const next = el?.getBoundingClientRect() ?? null;
    // Treat a zero-size box (e.g. inside a collapsed panel) as not there yet.
    setRect(next && next.width > 0 && next.height > 0 ? next : null);
  }, [step]);

  useEffect(() => {
    if (showWelcome) return undefined;
    let scrolled = false;
    const tick = () => {
      const el = document.getElementById(step.targetId);
      if (el && !scrolled) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        scrolled = true;
      }
      updateRect();
    };
    tick();
    // Polling (rather than a one-off lookup) covers both the element appearing
    // later — after a navigation or once data loads — and layout shifts.
    const poll = setInterval(tick, 400);
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);
    return () => {
      clearInterval(poll);
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [stepIndex, showWelcome, step, updateRect]);

  // Cloudscape portals <Modal>'s real dialog to a node it appends directly to
  // document.body, outside anything we could wrap it in — so a dir attribute
  // on a wrapper never reaches it. Toggling dir on <html> does (dir is
  // inherited), and #app pins its own dir="ltr" (index.html) so the console
  // underneath doesn't mirror. Same trick as the EC2 lab.
  useEffect(() => {
    if (!showWelcome) return undefined;
    const html = document.documentElement;
    const previousDir = html.getAttribute('dir');
    html.setAttribute('dir', dir);
    return () => {
      if (previousDir === null) html.removeAttribute('dir');
      else html.setAttribute('dir', previousDir);
    };
  }, [showWelcome, dir]);

  if (showWelcome) {
    return createPortal(
      <Modal visible onDismiss={onExit} header={renderBidi(welcome.title)}>
        <div dir={dir} className="fts-font">
          <div className="fts-lang-row">
            <LanguageToggle />
          </div>
          <p style={{ marginTop: 12 }}>{renderBidi(welcome.body)}</p>
          <div className="fts-modal-actions">
            <button
              type="button"
              className="fts-btn-secondary"
              onClick={onExit}
            >
              {ui.skip}
            </button>
            <button
              type="button"
              className="fts-btn-primary"
              onClick={() => setShowWelcome(false)}
            >
              {ui.start}
            </button>
          </div>
        </div>
      </Modal>,
      document.body,
    );
  }

  return createPortal(
    <>
      {rect && (
        <div
          className="tutorial-spotlight"
          style={{
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
          }}
        />
      )}
      <div
        className="tutorial-panel fts-font"
        role="dialog"
        aria-label="Guided walkthrough"
        dir={dir}
      >
        <div className="fts-panel-header">
          <span className="tutorial-step-label">
            {ui.stepLabel(stepIndex + 1, steps.length)}
          </span>
          <LanguageToggle />
        </div>
        <h3 className="tutorial-title">{renderBidi(step.title)}</h3>
        <p className="tutorial-description">{renderBidi(step.description)}</p>
        {step.tip && <div className="tutorial-tip">{renderBidi(step.tip)}</div>}
        {!rect && <div className="tutorial-waiting">{ui.waiting}</div>}
        <div className="fts-panel-actions">
          <button type="button" className="fts-btn-secondary" onClick={onExit}>
            {ui.exit}
          </button>
          <div className="fts-panel-actions-end">
            {stepIndex > 0 && (
              <button
                type="button"
                className="fts-btn-secondary"
                onClick={() => setStepIndex((i) => i - 1)}
              >
                {ui.back}
              </button>
            )}
            {isLast ? (
              <button
                type="button"
                className="fts-btn-primary"
                onClick={onExit}
              >
                {ui.finish}
              </button>
            ) : (
              <button
                type="button"
                className="fts-btn-primary"
                onClick={() => setStepIndex((i) => i + 1)}
              >
                {ui.next}
              </button>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
