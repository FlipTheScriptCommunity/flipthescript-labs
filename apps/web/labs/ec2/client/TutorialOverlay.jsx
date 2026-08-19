import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Modal from '@cloudscape-design/components/modal';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { TUTORIAL_STEPS } from './tutorialSteps';

// Renders a full-page guided walkthrough via a React portal to document.body,
// so it sits above the app regardless of AppLayout's own stacking context.
export default function TutorialOverlay({ onExit }) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState(null);

  const step = TUTORIAL_STEPS[stepIndex];
  const isLast = stepIndex === TUTORIAL_STEPS.length - 1;

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

  const goNext = () => setStepIndex((i) => Math.min(i + 1, TUTORIAL_STEPS.length - 1));
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  if (showWelcome) {
    return createPortal(
      <Modal
        visible
        header="Launch your first EC2 instance"
        onDismiss={onExit}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={onExit}>Skip, I'll explore on my own</Button>
              <Button variant="primary" onClick={() => setShowWelcome(false)}>
                Start walkthrough
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        This guided walkthrough highlights each part of the "Launch an instance" page and explains what
        it does, in the order you'd normally fill it out — {TUTORIAL_STEPS.length} steps in total. Use
        Next and Back to move through them, or exit at any time.
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
      <div className="tutorial-panel" role="dialog" aria-label="Guided walkthrough">
        <Box variant="small" color="text-body-secondary">
          Step {stepIndex + 1} of {TUTORIAL_STEPS.length}
        </Box>
        <Box variant="h3" padding={{ top: 'xxs', bottom: 'xxs' }}>
          {step.title}
        </Box>
        <Box>{step.description}</Box>
        {step.tip && (
          <Box margin={{ top: 's' }} padding="s" className="tutorial-tip">
            {step.tip}
          </Box>
        )}
        <Box margin={{ top: 'm' }}>
          <Box float="left">
            <Button onClick={onExit}>Exit walkthrough</Button>
          </Box>
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              {stepIndex > 0 && <Button onClick={goBack}>Back</Button>}
              {!isLast ? (
                <Button variant="primary" onClick={goNext}>
                  Next
                </Button>
              ) : (
                <Button variant="primary" onClick={onExit}>
                  Finish
                </Button>
              )}
            </SpaceBetween>
          </Box>
        </Box>
      </div>
    </>,
    document.body
  );
}
