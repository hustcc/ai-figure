'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { fig } from 'ai-figure';
import { encodeMarkdownBrowser } from '@/lib/decode';

/* ── system prompt ────────────────────────────────────────────────── */
const SYSTEM_PROMPT = `You are an ai-figure diagram generator. Output ONLY raw ai-figure markdown — no explanations, no code fences, no preamble, no trailing text.

## Header (required, first line)

figure <type>
Valid types: flow  tree  arch  sequence  quadrant  gantt  state  er  timeline  swimlane  bubble  radar

## Config keys (after header, before data lines)

title: any string
subtitle: any string
theme: light | dark
palette: default | antv | drawio | figma | vega | mono-blue | mono-green | mono-purple | mono-orange
direction: TB | LR    %% flow / tree / arch ONLY — omit for all other types

Lines starting with %% are comments.

## Node notation — flow / tree / arch / state / swimlane

id[label]      process (rectangle)
id{label}      decision (diamond)
id((label))    terminal (pill)
id[/label/]    io (parallelogram)
id             bare id — id used as label (process shape)

Edges: A --> B   or   A --> B: label

## Examples

### flow
figure flow
direction: LR
palette: antv
title: CI Pipeline
subtitle: automated build and deploy
code[Write Code] --> test{Tests Pass?}
test --> build[Build Image]: yes
test --> fix((Fix Issues)): no
fix --> code
build --> deploy[/Deploy/]
group Pipeline: code, test, build

### tree
figure tree
direction: LR
title: Org Chart
ceo[CEO]
ceo --> eng[Engineering]
ceo --> mkt[Marketing]
eng --> fe[Frontend]
eng --> be[Backend]

### arch
figure arch
direction: TB
palette: antv
title: Web Stack
subtitle: three-tier architecture
layer Frontend
  ui[React App]
  assets[Static Assets]
layer Backend
  api[REST API]
  auth[Auth Service]
layer Data
  db[PostgreSQL]
  cache[Redis]
ui --> api
api --> db
api --> cache

### sequence
figure sequence
title: OAuth Login
subtitle: password flow
actors: Browser, API, DB
Browser -> API: POST /login        %% solid arrow  →
API -> DB: query user
DB --> API: user row               %% dashed return arrow  ⇢
API --> Browser: JWT token

### quadrant
figure quadrant
title: Feature Priority
subtitle: effort vs value
x-axis Effort: Low .. High
y-axis Value: Low .. High
quadrant-1: Quick Wins
quadrant-2: Strategic
quadrant-3: Low Prio
quadrant-4: Long Shots
Auth: 0.3, 0.9
Search: 0.7, 0.8
Analytics: 0.8, 0.4

### gantt
figure gantt
title: Q1 Roadmap
subtitle: Jan – Mar 2025
section Design
  Wireframes: t1, 2025-01-06, 2025-01-24
  Mockups: t2, 2025-01-25, 2025-02-07
section Dev
  Frontend: t3, 2025-02-03, 2025-02-28
  Backend: t4, 2025-02-10, 2025-03-07
milestone: Launch, 2025-03-14

### state
figure state
title: Order Status
idle[Idle]
processing[Processing]
failed[Failed]
accent: failed
start --> idle
idle --> processing: order placed
processing --> failed: error
processing --> end: shipped
failed --> idle: retry

### er
figure er
title: Blog Schema
subtitle: users, posts, comments
entity User
  id pk: uuid
  email: text
  name: text
entity Post
  id pk: uuid
  author_id fk: uuid
  title: text
  body: text
entity Comment
  id pk: uuid
  post_id fk: uuid
  author_id fk: uuid
  body: text
User --> Post: writes
Post --> Comment: has
User --> Comment: writes

### timeline
figure timeline
title: Product History
subtitle: major releases
2020-01-15: v1.0 Launch milestone
2021-06-01: v1.5 Improvements
2022-03-10: v2.0 Redesign milestone
2023-11-01: v3.0 AI Features

### swimlane
figure swimlane
title: Order Flow
subtitle: cross-team process
section Customer
  order[Place Order]
  pay[Confirm Payment]
section Warehouse
  receive[Receive Order]
  pack[Pack Items]
section Shipping
  ship[Ship Package]
order --> pay
pay --> receive
receive --> pack
pack --> ship

### bubble
figure bubble
title: Market Share
subtitle: by product segment
Product A: 75
Product B: 50
Product C: 85
Product D: 30

### radar
figure radar
title: Framework Comparison
subtitle: 2025 technical evaluation
axes: Performance, Scalability, DX, Ecosystem, Tooling
React: 75, 80, 90, 95, 88
Vue: 82, 72, 90, 82, 80
Angular: 65, 92, 72, 90, 86

## Common pitfalls

WRONG                          CORRECT                        Note
type: flow                     figure flow                    figure <type> is the header, not a config key
A -->|label| B                 A --> B: label                 Mermaid pipe-label syntax not supported
[*] --> idle                   start --> idle                 Use start / end pseudo-ids (not [*])
Task: start, end (gantt)       Task: id, start, end           Task id is required in gantt
direction: LR (in gantt)       (omit direction)               direction only applies to flow / tree / arch
Browser --> API (sequence)     Browser -> API                 -> is solid arrow; --> is dashed return arrow

Output ONLY the raw markdown. No explanations. No code fences.`;

/* ── localStorage keys ────────────────────────────────────────────── */
const LS_BASEURL = 'aifigure-llm-baseurl';
const LS_MODEL   = 'aifigure-llm-model';
const LS_KEY     = 'aifigure-llm-key';

/* ── component ────────────────────────────────────────────────────── */
export default function AIPlaygroundPage() {
  /* LLM config */
  const [baseURL, setBaseURL] = useState('https://api.openai.com/v1');
  const [model,   setModel]   = useState('gpt-4o');
  const [apiKey,  setApiKey]  = useState('');
  const [configOpen, setConfigOpen] = useState(false);

  /* query + generation */
  const [query,      setQuery]      = useState('');
  const [markdown,   setMarkdown]   = useState('');
  const [svg,        setSvg]        = useState('');
  const [generating, setGenerating] = useState(false);
  const [error,      setError]      = useState('');

  /* action buttons */
  const [showSource, setShowSource] = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [infoMsg,    setInfoMsg]    = useState('');

  const abortRef = useRef<AbortController | null>(null);

  /* load settings from localStorage */
  useEffect(() => {
    const u = localStorage.getItem(LS_BASEURL);
    const m = localStorage.getItem(LS_MODEL);
    const k = localStorage.getItem(LS_KEY);
    if (u) setBaseURL(u);
    if (m) setModel(m);
    if (k) setApiKey(k);
  }, []);

  /* cleanup on unmount */
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  /* ── config helpers ─────────────────────────────────────────────── */
  const saveBaseURL = (v: string) => { setBaseURL(v); localStorage.setItem(LS_BASEURL, v); };
  const saveModel   = (v: string) => { setModel(v);   localStorage.setItem(LS_MODEL, v);   };
  const saveApiKey  = (v: string) => { setApiKey(v);  localStorage.setItem(LS_KEY, v);     };

  /* ── generate ───────────────────────────────────────────────────── */
  const handleGenerate = useCallback(async () => {
    if (!query.trim() || generating) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setGenerating(true);
    setError('');
    setMarkdown('');
    setSvg('');
    setShowSource(false);

    try {
      const url = baseURL.replace(/\/$/, '') + '/chat/completions';
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user',   content: query },
          ],
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`API ${res.status}: ${text}`);
      }

      if (!res.body) throw new Error('No response body');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const json = JSON.parse(data);
            const delta: string | undefined = json.choices?.[0]?.delta?.content;
            if (delta) {
              accumulated += delta;
              setMarkdown(accumulated);
              try { setSvg(fig(accumulated)); } catch { /* fig() is streaming-safe but may throw on partial input; keep the last valid SVG */ }
            }
          } catch { /* skip malformed SSE lines */ }
        }
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setError((e as Error).message || 'Generation failed');
      }
    } finally {
      setGenerating(false);
    }
  }, [query, baseURL, model, apiKey, generating]);

  /* ── key submit ─────────────────────────────────────────────────── */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  /* ── download SVG ───────────────────────────────────────────────── */
  const handleDownload = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const href = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href, download: 'diagram.svg' });
    a.click();
    URL.revokeObjectURL(href);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  /* ── share ──────────────────────────────────────────────────────── */
  const handleShare = async () => {
    if (!markdown) return;
    try {
      const hash = await encodeMarkdownBrowser(markdown);
      const shareUrl = `${window.location.origin}/s#${hash}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write can fail if permission is denied or API is unavailable.
      // Fall back to showing the URL in an info message so the user can copy it manually.
      try {
        const hash = await encodeMarkdownBrowser(markdown);
        setInfoMsg(`Share link (copy manually): ${window.location.origin}/s#${hash}`);
        setTimeout(() => setInfoMsg(''), 10000);
      } catch { /* encoding failed — nothing to show */ }
    }
  };

  const hasResult = svg || (generating && markdown);

  /* ── render ─────────────────────────────────────────────────────── */
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">

      {/* Page heading */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-sm font-medium px-3 py-1 rounded-full border border-orange-100 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
          AI Playground
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">
          Generate diagrams with AI
        </h1>
        <p className="text-slate-500">
          Describe a diagram in plain language and watch it render in real-time.
        </p>
      </div>

      {/* ── LLM Config ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 mb-5 overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          onClick={() => setConfigOpen((o) => !o)}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            LLM Configuration
          </span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${configOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {configOpen && (
          <div className="border-t border-slate-100 px-5 py-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Base URL</label>
              <input
                type="url"
                value={baseURL}
                onChange={(e) => saveBaseURL(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => saveModel(e.target.value)}
                placeholder="gpt-4o"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => saveApiKey(e.target.value)}
                placeholder="sk-…"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <p className="sm:col-span-2 text-xs text-slate-400">
              Settings are saved locally in your browser and never sent to our servers.
            </p>
          </div>
        )}
      </div>

      {/* ── Query ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Describe your diagram
        </label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. A CI/CD pipeline: push code → lint → test → build docker image → deploy to production"
          rows={3}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 resize-none"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={generating || !query.trim()}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            {generating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate
              </>
            )}
          </button>
          {generating && (
            <button
              onClick={() => abortRef.current?.abort()}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          )}
          <span className="text-xs text-slate-400 ml-auto hidden sm:block">⌘ Enter to generate</span>
        </div>
      </div>

      {/* ── Error ─────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 mb-5">
          <p className="text-sm font-medium text-red-700 mb-0.5">Generation failed</p>
          <p className="text-sm text-red-600 font-mono break-all">{error}</p>
        </div>
      )}

      {/* ── Info ──────────────────────────────────────────────────── */}
      {infoMsg && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 mb-5">
          <p className="text-sm font-medium text-blue-700 mb-0.5">Share link</p>
          <p className="text-sm text-blue-600 font-mono break-all">{infoMsg}</p>
        </div>
      )}

      {/* ── Result ────────────────────────────────────────────────── */}
      {hasResult && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              {generating ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse inline-block" />
                  Rendering…
                </span>
              ) : 'Diagram'}
            </span>
            <div className="flex items-center gap-2">
              {/* Source */}
              <button
                onClick={() => setShowSource((s) => !s)}
                title="Toggle source"
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border transition-all ${
                  showSource
                    ? 'border-orange-300 bg-orange-50 text-orange-600'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Source
              </button>

              {/* Download */}
              <button
                onClick={handleDownload}
                disabled={!svg}
                title="Download SVG"
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900 disabled:opacity-40 transition-all"
              >
                {downloaded ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-600">Saved!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    SVG
                  </>
                )}
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                disabled={!markdown}
                title="Copy share link"
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900 disabled:opacity-40 transition-all"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SVG preview */}
          <div
            className="p-5 overflow-x-auto [&>svg]:block [&>svg]:mx-auto [&>svg]:max-w-full [&>svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
          />

          {/* Source panel */}
          {showSource && markdown && (
            <div className="border-t border-slate-100">
              <div className="bg-slate-800 rounded-none px-4 py-1.5 text-xs font-mono text-slate-400 uppercase tracking-wider border-b border-slate-700">
                Source
              </div>
              <pre className="bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed p-5 overflow-x-auto whitespace-pre">
                {markdown}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Empty state hint */}
      {!hasResult && !error && (
        <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.144 2.798H4.942c-1.174 0-2.144-1.798-1.144-2.798L5 14.5" />
          </svg>
          <p className="text-sm">Describe a diagram above and click <strong className="font-semibold text-slate-500">Generate</strong></p>
        </div>
      )}
    </main>
  );
}
