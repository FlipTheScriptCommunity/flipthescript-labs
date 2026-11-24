import React, { useRef } from 'react';

// A deliberately small code editor: a textarea with a line-number gutter and
// a file tab, styled like the real Lambda console's dark editor. (Cloudscape's
// own CodeEditor needs the Ace editor as an extra dependency, which would
// roughly double this lab's bundle for little teaching value.)
export default function CodeEditor({
  value,
  onChange,
  fileName,
  ariaLabel,
  small = false,
}) {
  const gutterRef = useRef(null);
  const lineCount = value.split('\n').length;

  // Tab inserts two spaces instead of moving focus out of the editor.
  const handleKeyDown = (e) => {
    if (e.key !== 'Tab' || e.shiftKey) return;
    e.preventDefault();
    const el = e.target;
    const { selectionStart, selectionEnd } = el;
    const next = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`;
    onChange(next);
    requestAnimationFrame(() => {
      el.selectionStart = selectionStart + 2;
      el.selectionEnd = selectionStart + 2;
    });
  };

  // Keep the line numbers scrolled in step with the code.
  const handleScroll = (e) => {
    if (gutterRef.current) gutterRef.current.scrollTop = e.target.scrollTop;
  };

  return (
    <div dir="ltr">
      {fileName && <div className="lambda-editor-tab">{fileName}</div>}
      <div className={`lambda-editor${small ? ' lambda-editor-small' : ''}`}>
        <div className="lambda-editor-gutter" ref={gutterRef} aria-hidden>
          {Array.from({ length: lineCount }, (_, i) => i + 1).join('\n')}
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label={ariaLabel}
        />
      </div>
    </div>
  );
}
