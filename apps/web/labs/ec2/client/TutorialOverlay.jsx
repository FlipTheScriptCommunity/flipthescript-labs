import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Modal from '@cloudscape-design/components/modal';
import { TUTORIAL_CONTENT } from './tutorialSteps';

// tutorialSteps.js marks embedded English/technical terms (EC2, AMI,
// t2.micro, quoted UI labels, ...) with ... delimiters via its
// en() helper. This splits on those markers and wraps each marked segment in
// a real <bdi dir="ltr"> element — the HTML5 element built exactly for
// isolating text of foreign directionality — so multi-word phrases, numbers,
// and punctuation inside it can't visually reorder the surrounding Hebrew
// sentence. Strings with no markers pass through unchanged.
const BIDI_SPLIT = /(.*?)/g;
function renderBidi(text) {
  if (typeof text !== 'string' || !text.includes('')) return text;
  return text.split(BIDI_SPLIT).map((part, i) =>
    i % 2 === 1 ? (
      <bdi dir="ltr" key={i}>
        {part}
      </bdi>
    ) : (
      part
    )
  );
}

function LanguageToggle({ language, onChange }) {
  // Fixed dir="rtl" regardless of the active tutorial language: without it,
  // this toggle inherits whatever direction the surrounding content is
  // currently in, so its two buttons would swap left/right every time the
  // language changes — disorienting for a control whose whole job is
  // switching language. Keeping עברית on the right / EN on the left always
  // gives it a stable, predictable position.
  return (
    <div className="fts-lang-toggle" dir="rtl" role="group" aria-label="Language / שפה">
      <button type="button" className={language === 'he' ? 'active' : ''} onClick={() => onChange('he')}>
        עברית
      </button>
      <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => onChange('en')}>
        EN
      </button>
    </div>
  );
}

// Renders a full-page guided walkthrough via a React portal to document.body,
// so it sits above the app regardless of AppLayout's own stacking context.
// Styled with FlipTheScript's own brand colors (gold/blue/purple) rather than
// Cloudscape's button styles, so it reads as the course platform's teaching
// layer rather than another part of the simulated AWS console underneath it.
export default function TutorialOverlay({ onExit }) {
  const [language, setLanguage] = useState('he');
  const [showWelcome, setShowWelcome] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState(null);

  const content = TUTORIAL_CONTENT[language];
  const steps = content.steps;
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  const updateRect = useCallback(() => {
    const el = document.getElementById(step.targetId);
    if (el) {
      setRect(el.getBoundingClientRect());
    }
  }, [step]);

  useEffect(() => {
    if (showWelcome) return undefined;
    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    updateRect();
    const scrollTimer = setTimeout(updateRect, 350);
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);
    return () => {
      clearTimeout(scrollTimer);
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [stepIndex, showWelcome, updateRect, step]);

  const goNext = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  // Cloudscape's <Modal> doesn't render in place in the DOM — internally it
  // portals its actual dialog markup to a brand-new node it appends directly
  // to document.body, entirely outside whatever we wrap it in here. So a
  // dir="{content.dir}" div around <Modal> (like the one below) only ever
  // wraps an empty placeholder; it never reaches the real, visible dialog,
  // which was silently falling back to the document's base ltr direction the
  // whole time. dir *is* still an inherited DOM/CSS attribute though, and
  // Cloudscape's dialog is a real descendant of <html> (just not of our own
  // wrapper) — so toggling it on the document root while the modal is open
  // does reach it. This is safe specifically because the modal's own
  // backdrop fully covers and disables the underlying AWS console while
  // open, so the console never visibly sits in the "wrong" direction.
  useEffect(() => {
    if (!showWelcome) return undefined;
    const html = document.documentElement;
    const previousDir = html.getAttribute('dir');
    html.setAttribute('dir', content.dir);
    return () => {
      if (previousDir === null) html.removeAttribute('dir');
      else html.setAttribute('dir', previousDir);
    };
  }, [showWelcome, content.dir]);

  if (showWelcome) {
    // No wrapping dir/className div here — as the effect above explains, it
    // would never reach Modal's actual (portaled) rendered output anyway.
    // Direction comes from the document-level toggle; the Rubik font comes
    // from a global rule in styles.css targeting Cloudscape's dialog role
    // directly, for the same reason.
    return createPortal(
      <Modal visible onDismiss={onExit} header={renderBidi(content.welcome.title)}>
        <div dir={content.dir}>
          <div className="fts-lang-row">
            <LanguageToggle language={language} onChange={setLanguage} />
          </div>
          <p style={{ marginTop: 12 }}>{renderBidi(content.welcome.body)}</p>
          <div className="fts-modal-actions">
            <button type="button" className="fts-btn-secondary" onClick={onExit}>
              {content.welcome.skip}
            </button>
            <button type="button" className="fts-btn-primary" onClick={() => setShowWelcome(false)}>
              {content.welcome.start}
            </button>
          </div>
        </div>
      </Modal>,
      document.body
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
      <div className="tutorial-panel fts-font" role="dialog" aria-label="Guided walkthrough" dir={content.dir}>
        <div className="fts-panel-header">
          <span className="tutorial-step-label">{content.ui.stepLabel(stepIndex + 1, steps.length)}</span>
          <LanguageToggle language={language} onChange={setLanguage} />
        </div>
        <h3 className="tutorial-title">{renderBidi(step.title)}</h3>
        <p className="tutorial-description">{renderBidi(step.description)}</p>
        {step.tip && <div className="tutorial-tip">{renderBidi(step.tip)}</div>}
        <div className="fts-panel-actions">
          <button type="button" className="fts-btn-secondary" onClick={onExit}>
            {content.ui.exit}
          </button>
          <div className="fts-panel-actions-end">
            {stepIndex > 0 && (
              <button type="button" className="fts-btn-secondary" onClick={goBack}>
                {content.ui.back}
              </button>
            )}
            {!isLast ? (
              <button type="button" className="fts-btn-primary" onClick={goNext}>
                {content.ui.next}
              </button>
            ) : (
              <button type="button" className="fts-btn-primary" onClick={onExit}>
                {content.ui.finish}
              </button>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
