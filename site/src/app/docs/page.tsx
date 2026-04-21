import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Docs',
  description: 'ai-figure documentation: usage, config, markdown syntax for all 10 diagram types, and Skill file for AI agents.',
};

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-slate-900 text-slate-100 rounded-xl p-5 text-sm leading-relaxed overflow-x-auto font-mono whitespace-pre">
      <code>{children}</code>
    </pre>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-12 mb-4">{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-600 leading-relaxed mb-4">{children}</p>;
}

export default function DocsPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-3">Documentation</h1>
      <p className="text-lg text-slate-500 mb-12">Complete reference for ai-figure — usage, config, markdown syntax, and Skill.</p>

      {/* ── Usage ── */}
      <section id="usage">
        <H2>Usage</H2>
        <H3>Install</H3>
        <Code>{`npm install ai-figure`}</Code>

        <H3>API</H3>
        <P>
          Single entry point: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800">fig(input)</code> — accepts a markdown string or a JSON config object, returns a self-contained SVG string.
        </P>
        <Code>{`import { fig } from 'ai-figure';

// Markdown string (preferred — compact, AI-friendly)
const svg = fig(\`
  figure flow
  direction: LR
  palette: antv
  A[Start] --> B[End]
\`);

// JSON config (typed, programmatic)
const svg2 = fig({
  figure: 'flow',
  nodes: [
    { id: 'a', label: 'Start', type: 'terminal' },
    { id: 'b', label: 'End',   type: 'terminal' },
  ],
  edges: [{ from: 'a', to: 'b' }],
});

// Browser
document.getElementById('chart').innerHTML = svg;

// Node.js
import { writeFileSync } from 'fs';
writeFileSync('diagram.svg', svg);`}</Code>

        <H3>Streaming-safe</H3>
        <P>
          When given a string, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800">fig()</code> never throws. Partial or empty input (e.g. while an AI is still streaming) returns a valid 1×1 empty SVG that fills in as more content arrives.
        </P>
      </section>

      {/* ── Config ── */}
      <section id="config">
        <H2>Config</H2>
        <P>Config lines use <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800">key: value</code> syntax and appear after the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800">figure &lt;type&gt;</code> header.</P>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-6 font-semibold text-slate-700">Key</th>
                <th className="text-left py-2 pr-6 font-semibold text-slate-700">Values</th>
                <th className="text-left py-2 font-semibold text-slate-700">Default</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {[
                ['title', 'any string', '—'],
                ['subtitle', 'any string', '—'],
                ['direction', 'TB · LR', 'TB'],
                ['theme', 'light · dark', 'light'],
                ['palette', 'default · antv · drawio · figma · vega · mono-blue · mono-green · mono-purple · mono-orange', 'default'],
              ].map(([key, vals, def]) => (
                <tr key={key} className="border-b border-slate-100">
                  <td className="py-2 pr-6 font-mono text-slate-800">{key}</td>
                  <td className="py-2 pr-6 text-slate-500">{vals}</td>
                  <td className="py-2 font-mono text-slate-500">{def}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <H3>Palettes</H3>
        <div className="flex flex-wrap gap-2 mb-6">
          {['default', 'antv', 'drawio', 'figma', 'vega', 'mono-blue', 'mono-green', 'mono-purple', 'mono-orange'].map((p) => (
            <code key={p} className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-700">
              {p}
            </code>
          ))}
        </div>

        <H3>Node notation (flow / tree / arch)</H3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-6 font-semibold text-slate-700">Notation</th>
                <th className="text-left py-2 font-semibold text-slate-700">Shape</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 font-mono">
              {[
                ['id[label]', 'process (rectangle)'],
                ['id{label}', 'decision (diamond)'],
                ['id((label))', 'terminal (pill)'],
                ['id[/label/]', 'io (parallelogram)'],
                ['id', 'process, id used as label'],
              ].map(([n, s]) => (
                <tr key={n} className="border-b border-slate-100">
                  <td className="py-2 pr-6">{n}</td>
                  <td className="py-2 font-sans text-slate-500">{s}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Syntax ── */}
      <section id="syntax">
        <H2>Syntax</H2>
        <P>First line must be <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800">figure &lt;type&gt;</code>. Lines starting with <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800">%%</code> are comments.</P>

        <H3>flow</H3>
        <Code>{`figure flow
direction: LR
palette: antv
title: My Flow
A[Source] --> B[Target]          %% simple edge
A --> B[Target]: label           %% labeled edge
group Name: id1, id2, id3        %% logical group (dashed border)`}</Code>

        <H3>tree</H3>
        <Code>{`figure tree
direction: LR
title: Org Chart
root[Root]
root --> child[Child]
child --> leaf[Leaf]`}</Code>

        <H3>arch</H3>
        <Code>{`figure arch
direction: TB
palette: antv
title: Web Stack
layer Frontend
  ui[React App]
  assets[Static Assets]
layer Backend
  api[REST API]
  auth[Auth Service]
layer Data
  db[PostgreSQL]`}</Code>

        <H3>sequence</H3>
        <Code>{`figure sequence
title: Login
actors: Browser, API, DB
Browser -> API: POST /login      %% solid arrow
API --> Browser: 200 OK          %% dashed return arrow`}</Code>

        <H3>quadrant</H3>
        <Code>{`figure quadrant
title: Priority
x-axis Effort: Low .. High
y-axis Value: Low .. High
quadrant-1: Quick Wins    %% top-left
quadrant-2: Strategic     %% top-right
quadrant-3: Low Prio      %% bottom-left
quadrant-4: Long Shots    %% bottom-right
Feature A: 0.2, 0.9       %% label: x, y  (0–1)`}</Code>

        <H3>gantt</H3>
        <Code>{`figure gantt
title: Q1 Roadmap
section Design
  Wireframes: t1, 2025-01-06, 2025-01-24
  Mockups: t2, 2025-01-25, 2025-02-07
section Dev
  Frontend: t3, 2025-02-03, 2025-02-28
milestone: Launch, 2025-03-01`}</Code>

        <H3>state</H3>
        <Code>{`figure state
title: Order Status
idle[Idle]
processing[Processing]
accent: failed
start --> idle
idle --> processing: order placed
processing --> end: shipped
processing --> failed: error
failed --> idle: retry`}</Code>

        <H3>er</H3>
        <Code>{`figure er
title: Blog Schema
entity User
  id pk: uuid
  email: text
entity Post
  id pk: uuid
  author_id fk: uuid
  title: text
User --> Post: writes`}</Code>

        <H3>timeline</H3>
        <Code>{`figure timeline
title: Product History
2020-01-15: v1.0 Launch milestone
2021-06-01: v1.5 Improvements
2022-03-10: v2.0 Redesign milestone`}</Code>

        <H3>swimlane</H3>
        <Code>{`figure swimlane
title: Order Flow
section Customer
  order[Place Order]
  pay[Confirm Payment]
section Warehouse
  receive[Receive Order]
  pack[Pack Items]
order --> pay
pay --> receive
receive --> pack`}</Code>
      </section>

      {/* ── Skill ── */}
      <section id="skill">
        <H2>Skill — AI Agent Integration</H2>
        <P>
          ai-figure ships a <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800">SKILL.md</code> file designed for AI agents (GitHub Copilot, Cursor, Claude, etc.).
          Load it as context and the agent can generate diagrams without any additional prompting.
        </P>
        <Code>{`// GitHub Copilot / Cursor — add to .github/copilot-instructions.md or similar:
// @file node_modules/ai-figure/SKILL.md

// Or reference directly in your prompt:
// "Using the ai-figure SKILL.md at node_modules/ai-figure/SKILL.md, create a sequence diagram..."`}</Code>
        <P>
          The Skill file contains the full markdown syntax reference, all config keys, and JSON type definitions.
          It is designed to be compact and machine-readable while remaining human-friendly.
        </P>
      </section>
    </main>
  );
}
