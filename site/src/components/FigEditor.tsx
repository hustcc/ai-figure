'use client';

import { useRef, useCallback } from 'react';
import { highlight } from '@/lib/figHighlight';

/* ── component ──────────────────────────────────────────────────── */
interface FigEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function FigEditor({ value, onChange, className = '' }: FigEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef      = useRef<HTMLPreElement>(null);

  const syncScroll = useCallback(() => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop  = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  /* shared style props – must match exactly between pre and textarea */
  const sharedStyle: React.CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: '0.875rem',
    lineHeight: '1.625',
    padding: '1.25rem',
    margin: 0,
    tabSize: 2,
    whiteSpace: 'pre',
    overflowWrap: 'normal',
    wordBreak: 'normal',
  };

  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-slate-900 ${className}`}
      style={{ minHeight: '300px' }}
    >
      {/* syntax-highlighted read-only layer */}
      <pre
        ref={preRef}
        aria-hidden="true"
        className="absolute inset-0 overflow-auto text-slate-100 pointer-events-none"
        style={sharedStyle}
        dangerouslySetInnerHTML={{ __html: highlight(value) + '\n' }}
      />

      {/* editable transparent textarea on top */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className="relative block w-full h-full min-h-[inherit] resize-none border-0 outline-none"
        style={{
          ...sharedStyle,
          background: 'transparent',
          color: 'transparent',
          caretColor: '#e2e8f0',
          WebkitTextFillColor: 'transparent',
          minHeight: '300px',
        }}
      />
    </div>
  );
}
