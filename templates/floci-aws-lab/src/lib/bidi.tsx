import type { ReactNode } from 'react';

// Hebrew teaching copy constantly quotes English UI labels and technical terms
// (S3, "Create bucket", hello.txt, ...). en() marks such a term with two
// non-printing control characters, and renderBidi() later wraps each marked
// segment in a real <bdi dir="ltr"> — the HTML element built for isolating
// embedded text of the other direction — so multi-word phrases, dots and
// punctuation can't visually reorder the surrounding Hebrew sentence.
// (Same approach as the EC2 lab's tutorialSteps.js.)
const MARK_START = '⁣';
const MARK_END = '⁤';

export const en = (s: string) => `${MARK_START}${s}${MARK_END}`;

const BIDI_SPLIT = new RegExp(`${MARK_START}(.*?)${MARK_END}`, 'g');

export function renderBidi(text: string): ReactNode {
  if (!text.includes(MARK_START)) return text;
  return text.split(BIDI_SPLIT).map((part, i) =>
    i % 2 === 1 ? (
      <bdi dir="ltr" key={i}>
        {part}
      </bdi>
    ) : (
      part
    ),
  );
}

/** The plain text, with the markers stripped — for aria labels and tests. */
export const stripBidi = (text: string) =>
  text.replaceAll(MARK_START, '').replaceAll(MARK_END, '');
