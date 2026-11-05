import type { KeyboardEvent } from 'react';

// A deliberately plain editor (a monospace <textarea>): Cloudscape's own
// CodeEditor needs the Ace editor bundled in, which is a lot of weight for a
// single short file. Tab inserts two spaces instead of moving focus.
export function CodeEditor({
  value,
  onChange,
  rows = 18,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Tab' || event.shiftKey) return;
    event.preventDefault();
    const el = event.currentTarget;
    const { selectionStart, selectionEnd } = el;
    const next = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`;
    onChange(next);
    requestAnimationFrame(() =>
      el.setSelectionRange(selectionStart + 2, selectionStart + 2),
    );
  };
  return (
    <textarea
      className="code-editor"
      value={value}
      rows={rows}
      spellCheck={false}
      aria-label="Function code"
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
    />
  );
}
