'use client';

import { useRef, useCallback } from 'react';

/* ── token colours ──────────────────────────────────────────────── */
// figure keyword
const C_FIGURE   = 'color:#fb923c;font-weight:600';  // orange-400
// diagram type (flow, tree …)
const C_TYPE     = 'color:#7dd3fc;font-weight:600';  // sky-300
// config keys (direction, title …)
const C_KEY      = 'color:#34d399;font-weight:500';  // emerald-400
// config value separator ":"
const C_SEP      = 'color:#64748b';                  // slate-500
// section / layer / entity / start / end
const C_STRUCT   = 'color:#a78bfa;font-weight:600';  // violet-400
// arrow operators
const C_ARROW    = 'color:#f472b6';                  // pink-400

const DIAGRAM_TYPES = new Set([
  'flow', 'tree', 'arch', 'sequence', 'quadrant', 'gantt',
  'state', 'er', 'timeline', 'swimlane', 'bubble', 'pyramid',
]);

const CONFIG_KEYS = new Set([
  'direction', 'title', 'subtitle', 'theme', 'palette',
  'accent', 'milestone', 'actors',
]);

/* ── helpers ────────────────────────────────────────────────────── */
function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function span(style: string, text: string) {
  return `<span style="${style}">${esc(text)}</span>`;
}

/* ── per-line tokeniser ─────────────────────────────────────────── */
function highlightLine(raw: string): string {
  const trimmed = raw.trimStart();
  const indent = raw.slice(0, raw.length - trimmed.length);

  if (!trimmed) return '';

  /* figure <type> */
  const figM = trimmed.match(/^(figure)(\s+)(\S+)(.*)/);
  if (figM) {
    const [, kw, sp, type, rest] = figM;
    const typeStyled = DIAGRAM_TYPES.has(type)
      ? span(C_TYPE, type)
      : esc(type);
    return esc(indent) + span(C_FIGURE, kw) + esc(sp) + typeStyled + esc(rest);
  }

  /* config key: value */
  const cfgM = trimmed.match(/^(\w+)(\s*:\s*)(.*)/);
  if (cfgM && CONFIG_KEYS.has(cfgM[1])) {
    const [, key, sep, value] = cfgM;
    return esc(indent) + span(C_KEY, key) + span(C_SEP, sep) + esc(value);
  }

  /* section / layer / entity <name> */
  const structM = trimmed.match(/^(section|layer|entity)(\s+)(.*)/);
  if (structM) {
    const [, kw, sp, rest] = structM;
    return esc(indent) + span(C_STRUCT, kw) + esc(sp) + esc(rest);
  }

  /* bare start / end */
  if (trimmed === 'start' || trimmed === 'end') {
    return esc(indent) + span(C_STRUCT, trimmed);
  }

  /* edge lines: highlight arrows.
   * We check on the raw string first, then regex on the HTML-escaped version.
   * After esc(), ">" → "&gt;", so "->" → "-&gt;", "-->" → "--&gt;", "-.-> "→ "-.-&gt;".
   * Pattern order (longest first) prevents "-&gt;" from matching inside "--&gt;" or "-.-&gt;".
   */
  if (trimmed.includes('-.->') || trimmed.includes('-->') || trimmed.includes('->')){
    return esc(raw).replace(/(-\.-&gt;|--&gt;|-&gt;)/g, (m) =>
      `<span style="${C_ARROW}">${m}</span>`
    );
  }

  return esc(raw);
}

function highlight(code: string): string {
  return code.split('\n').map(highlightLine).join('\n');
}

/* ── component ──────────────────────────────────────────────────── */
interface FigEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function FigEditor({ value, onChange }: FigEditorProps) {
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
      className="relative rounded-xl overflow-hidden bg-slate-900"
      style={{ minHeight: '12rem' }}
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
        className="relative block w-full min-h-[inherit] resize-none border-0 outline-none"
        style={{
          ...sharedStyle,
          background: 'transparent',
          color: 'transparent',
          caretColor: '#e2e8f0',
          WebkitTextFillColor: 'transparent',
          minHeight: '12rem',
        }}
      />
    </div>
  );
}
