import type { Metadata } from 'next';
import { fig } from 'ai-figure';
import CodeBlock from '@/components/CodeBlock';

export const metadata: Metadata = {
  title: 'Docs',
  description: 'ai-figure documentation: installation, usage, markdown syntax for all 11 diagram types, framework integration (React, Vue, HTML, Node.js), and AI agent Skill.',
};

/* ── small prose helpers ───────────────────────────────────────── */
function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-2xl font-bold tracking-tight text-slate-900 mt-14 mb-5 pb-2 border-b border-slate-200">
      {children}
    </h2>
  );
}
function H3({ id, children }: { id?: string; children: React.ReactNode }) {
  return <h3 id={id} className="text-lg font-semibold text-slate-900 mt-8 mb-3">{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-600 leading-relaxed mb-4">{children}</p>;
}
function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono">
      {children}
    </code>
  );
}

/* ── config table ────────────────────────────────────────────────── */
function ConfigTable({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2 pr-6 font-semibold text-slate-700">Key</th>
            <th className="text-left py-2 pr-6 font-semibold text-slate-700">Type / Values</th>
            <th className="text-left py-2 font-semibold text-slate-700">Default</th>
          </tr>
        </thead>
        <tbody className="text-slate-600">
          {rows.map(([key, vals, def]) => (
            <tr key={key} className="border-b border-slate-100">
              <td className="py-2 pr-6 font-mono text-slate-800 whitespace-nowrap">{key}</td>
              <td className="py-2 pr-6 text-slate-500">{vals}</td>
              <td className="py-2 font-mono text-slate-500 whitespace-nowrap">{def}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── inline SVG preview ──────────────────────────────────────────── */
function DiagramPreview({ markdown }: { markdown: string }) {
  const svg = fig(markdown);
  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-4 my-4 overflow-x-auto [&>svg]:block [&>svg]:mx-auto [&>svg]:max-w-full [&>svg]:h-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/* ── diagram section ─────────────────────────────────────────────── */
function DiagramSection({
  id, title, description, configRows, markdownExample, children,
}: {
  id: string;
  title: string;
  description: string;
  configRows: [string, string, string][];
  markdownExample: string;
  children?: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-12">
      <H3>{title}</H3>
      <P>{description}</P>
      <DiagramPreview markdown={markdownExample} />
      {children}
      <H3>Config</H3>
      <ConfigTable rows={configRows} />
      <H3>Markdown syntax</H3>
      <CodeBlock language="figmd">{markdownExample}</CodeBlock>
    </section>
  );
}

/* ── diagram examples ───────────────────────────────────────────── */
const COMMON_CONFIG: [string, string, string][] = [
  ['title', 'string', '—'],
  ['subtitle', 'string', '—'],
  ['theme', 'light · dark', 'light'],
  ['palette', 'default · antv · drawio · figma · vega · mono-blue · mono-green · mono-purple · mono-orange', 'default'],
];

const FLOW_MD = `figure flow
direction: TB
palette: antv
title: Auth Flow
subtitle: credential validation steps
start((Start)) --> login[Enter Credentials]
login --> validate{Valid?}
validate --> dashboard((Dashboard)): yes
validate --> error[Show Error]: no
error --> login
group Auth: login, validate`;

const TREE_MD = `figure tree
direction: TB
palette: default
title: Org Chart
subtitle: engineering & operations
ceo[CEO]
ceo --> cto[CTO]
ceo --> coo[COO]
cto --> fe[Frontend Lead]
cto --> be[Backend Lead]
coo --> ops[Operations]`;

const ARCH_MD = `figure arch
direction: TB
palette: figma
title: Web Stack
subtitle: three-tier architecture
layer Frontend
  ui[React App]
  cdn[CDN Assets]
layer Backend
  api[REST API]
  auth[Auth Service]
layer Data
  db[PostgreSQL]
  cache[Redis]`;

const SEQ_MD = `figure sequence
title: Login Flow
subtitle: token-based authentication
actors: Browser, API, DB
Browser -> API: POST /login
API -> DB: SELECT user
DB --> API: user row
API --> Browser: 200 OK + token`;

const QUADRANT_MD = `figure quadrant
title: Feature Priority
subtitle: effort vs value
x-axis Effort: Low .. High
y-axis Value: Low .. High
quadrant-1: Quick Wins
quadrant-2: Strategic
quadrant-3: Low Prio
quadrant-4: Long Shots
Search: 0.15, 0.9
Dashboard: 0.7, 0.85
Dark Mode: 0.25, 0.55
Export: 0.8, 0.35`;

const GANTT_MD = `figure gantt
title: Q1 Roadmap
subtitle: Jan – Mar 2025
section Design
  Wireframes: t1, 2025-01-06, 2025-01-24
  Mockups: t2, 2025-01-25, 2025-02-07
section Dev
  Frontend: t3, 2025-02-03, 2025-02-28
  Backend: t4, 2025-01-27, 2025-03-07
milestone: Launch, 2025-03-14`;

const STATE_MD = `figure state
title: Order Status
subtitle: e-commerce order lifecycle
accent: failed
start --> idle[Idle]
idle --> processing[Processing]: place order
processing --> shipped[Shipped]: confirmed
processing --> failed[Failed]: error
failed --> idle: retry
shipped --> end`;

const ER_MD = `figure er
title: Blog Schema
subtitle: users and posts
entity User
  id pk: uuid
  email: text
  name: text
entity Post
  id pk: uuid
  author_id fk: uuid
  title: text
User --> Post: writes`;

const TIMELINE_MD = `figure timeline
title: Product History
subtitle: major releases
2020-01-15: v1.0 Launch milestone
2021-06-01: v1.5 Improvements
2022-03-10: v2.0 Redesign milestone
2023-11-01: v3.0 AI Features milestone`;

const SWIMLANE_MD = `figure swimlane
title: Order Processing
subtitle: cross-team workflow
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
pack --> ship`;

const BUBBLE_MD = `figure bubble
title: Market Analysis
subtitle: Revenue by Product
Product A: 75
Product B: 50
Product C: 85
Product D: 30
Product E: 60
Product F: 20`;

/* ══════════════════════════════════════════════════════════════════ */

export default function DocsPage() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar TOC — hidden on small screens */}
      <aside className="hidden lg:block w-56 shrink-0 sticky top-0 self-start h-screen overflow-y-auto py-12 pl-6 pr-4 border-r border-slate-200 text-sm">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">On this page</p>
        <nav className="space-y-1">
          {[
            ['#getting-started', 'Getting Started'],
            ['#markdown-syntax', 'Markdown Syntax'],
            ['#diagram-flow', '→ Flow'],
            ['#diagram-tree', '→ Tree'],
            ['#diagram-arch', '→ Arch'],
            ['#diagram-sequence', '→ Sequence'],
            ['#diagram-quadrant', '→ Quadrant'],
            ['#diagram-gantt', '→ Gantt'],
            ['#diagram-state', '→ State'],
            ['#diagram-er', '→ ER'],
            ['#diagram-timeline', '→ Timeline'],
            ['#diagram-swimlane', '→ Swimlane'],
            ['#diagram-bubble', '→ Bubble'],
            ['#frameworks', 'Framework Integration'],
            ['#skill', 'AI Skill'],
          ].map(([href, label]) => (
            <a key={href} href={href} className="block text-slate-500 hover:text-orange-600 transition-colors py-0.5">
              {label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-3">Documentation</h1>
        <p className="text-lg text-slate-500 mb-12">Complete reference for ai-figure — installation, API, markdown syntax, diagram types, and framework integration.</p>

        {/* ═══════════════ 1. GETTING STARTED ═══════════════════════ */}
        <section aria-labelledby="getting-started">
          <H2 id="getting-started">Getting Started</H2>

          <H3>Install</H3>
          <CodeBlock language="bash">npm install ai-figure</CodeBlock>

          <H3>Import</H3>
          <P>ai-figure ships a single entry-point export. Works in both ES Modules and CommonJS environments.</P>
          <CodeBlock language="typescript">{`import { fig } from 'ai-figure';          // ESM
const { fig } = require('ai-figure');     // CJS`}</CodeBlock>

          <H3>Node.js usage</H3>
          <P>
            Call <Mono>fig()</Mono> and write the SVG string to a file or return it from a server route.
          </P>
          <CodeBlock language="typescript">{`import { fig } from 'ai-figure';
import { writeFileSync } from 'fs';

const svg = fig(\`
  figure flow
  direction: LR
  palette: antv
  title: CI Pipeline
  A[Commit] --> B[Test] --> C[Build] --> D[Deploy]
\`);

writeFileSync('pipeline.svg', svg);`}</CodeBlock>

          <H3>Browser usage</H3>
          <P>
            <Mono>fig()</Mono> has zero DOM dependency — it only builds an SVG string. Inject it wherever you need it.
          </P>
          <CodeBlock language="typescript">{`import { fig } from 'ai-figure';

const svg = fig(\`
  figure flow
  direction: LR
  A[Start] --> B[End]
\`);

document.getElementById('chart').innerHTML = svg;`}</CodeBlock>

          <H3>Streaming-safe</H3>
          <P>
            When given a markdown string, <Mono>fig()</Mono> never throws. Partial or empty input returns a valid 1×1 empty SVG, so you can pass AI streaming output directly — the diagram fills in progressively as tokens arrive.
          </P>
          <CodeBlock language="typescript">{`// Safe to call with partial AI output
const partialMarkdown = "figure flow\\ndirection: LR\\nA[Start";
const safeSvg = fig(partialMarkdown);  // returns empty SVG — no throw`}</CodeBlock>

          <H3>API</H3>
          <P>
            <Mono>fig(input)</Mono> accepts either a markdown string or a typed JSON config object, and always returns a self-contained SVG string.
          </P>
          <CodeBlock language="typescript">{`import { fig } from 'ai-figure';

// ── markdown string (compact, AI-friendly) ──────────────────────
const svg1 = fig(\`
  figure flow
  direction: LR
  palette: antv
  A[Start] --> B[End]
\`);

// ── JSON config (typed, programmatic) ───────────────────────────
const svg2 = fig({
  figure: 'flow',
  direction: 'LR',
  palette: 'antv',
  nodes: [
    { id: 'a', label: 'Start', type: 'terminal' },
    { id: 'b', label: 'End',   type: 'terminal' },
  ],
  edges: [{ from: 'a', to: 'b' }],
});`}</CodeBlock>
        </section>

        {/* ═══════════════ 2. MARKDOWN SYNTAX ══════════════════════════ */}
        <section aria-labelledby="markdown-syntax">
          <H2 id="markdown-syntax">Markdown Syntax</H2>
          <P>
            The first non-empty line must be <Mono>{'figure <type>'}</Mono>. Config lines follow, then diagram-specific data. Lines starting with <Mono>%%</Mono> are comments.
          </P>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 pr-6 font-semibold text-slate-700">Line type</th>
                  <th className="text-left py-2 pr-6 font-semibold text-slate-700">Syntax</th>
                  <th className="text-left py-2 font-semibold text-slate-700">Example</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {[
                  ['Header', 'figure <type>', 'figure flow'],
                  ['Config', 'key: value', 'direction: LR  ·  palette: antv  ·  title: My Chart'],
                  ['Comment', '%% text', '%% this line is ignored'],
                  ['Data', 'diagram-specific', 'A[Start] --> B[End]'],
                ].map(([type, syntax, example]) => (
                  <tr key={type} className="border-b border-slate-100">
                    <td className="py-2 pr-6 font-semibold text-slate-800">{type}</td>
                    <td className="py-2 pr-6 font-mono text-slate-700">{syntax}</td>
                    <td className="py-2 text-slate-500 font-mono text-xs">{example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <H3>Common config keys</H3>
          <ConfigTable rows={[
            ['title', 'string', '—'],
            ['subtitle', 'string', '—'],
            ['direction', 'TB · LR', 'TB'],
            ['theme', 'light · dark', 'light'],
            ['palette', 'default · antv · drawio · figma · vega · mono-blue · mono-green · mono-purple · mono-orange', 'default'],
          ]} />

          <H3>Node notation (flow / tree / arch / swimlane)</H3>
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
                  ['id((label))', 'terminal (rounded pill)'],
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

          <H3>Palettes</H3>
          <div className="flex flex-wrap gap-2 mb-4">
            {['default', 'antv', 'drawio', 'figma', 'vega', 'mono-blue', 'mono-green', 'mono-purple', 'mono-orange'].map((p) => (
              <code key={p} className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-700">
                {p}
              </code>
            ))}
          </div>
          <P>A custom 4-element hex array is also accepted: <Mono>{`palette: ['#e64980','#ae3ec9','#7048e8','#1098ad']`}</Mono></P>
        </section>

        {/* ═══════════════ 3. DIAGRAM TYPES ═══════════════════════════ */}
        <H2 id="diagram-types">Diagram Types</H2>

        {/* flow */}
        <DiagramSection
          id="diagram-flow"
          title="flow — Flowchart"
          description="General-purpose directed graph. Supports process, decision, terminal, and IO node shapes; edge labels; and logical groups with dashed borders."
          configRows={[
            ...COMMON_CONFIG,
            ['direction', 'TB · LR', 'TB'],
            ['nodes', 'FlowNode[]', 'required'],
            ['edges', 'FlowEdge[]', 'required'],
            ['groups', 'FlowGroup[]', '[]'],
          ]}
          markdownExample={FLOW_MD}
        >
          <P>Edge syntax: <Mono>A --{'>'} B</Mono> (unlabeled) or <Mono>A --{'>'} B: label</Mono>. Groups: <Mono>group Name: id1, id2</Mono>.</P>
        </DiagramSection>

        {/* tree */}
        <DiagramSection
          id="diagram-tree"
          title="tree — Tree / Hierarchy"
          description="Renders a rooted hierarchy using Dagre layout. Define edges with --> and the tree is computed automatically — no manual positioning needed."
          configRows={[
            ...COMMON_CONFIG,
            ['direction', 'TB · LR', 'TB'],
          ]}
          markdownExample={TREE_MD}
        />

        {/* arch */}
        <DiagramSection
          id="diagram-arch"
          title="arch — Architecture Diagram"
          description="Color-coded layer cards for tech-stack landscapes. No edges needed — just define layers and the nodes inside each layer."
          configRows={[
            ...COMMON_CONFIG,
            ['direction', 'TB (layers stacked) · LR (side-by-side)', 'TB'],
          ]}
          markdownExample={ARCH_MD}
        >
          <P>Layer syntax: <Mono>layer Name</Mono> followed by indented node lines <Mono>{'  id[Label]'}</Mono>.</P>
        </DiagramSection>

        {/* sequence */}
        <DiagramSection
          id="diagram-sequence"
          title="sequence — Sequence Diagram"
          description="UML sequence diagram with vertical lifelines and horizontal message arrows. Supports solid (→) and dashed return (-->) arrow styles."
          configRows={[
            ...COMMON_CONFIG,
            ['actors', 'string (comma-separated)', 'required'],
          ]}
          markdownExample={SEQ_MD}
        >
          <P>Declare actors with <Mono>actors: A, B, C</Mono>. Solid message: <Mono>A -{'>'} B: label</Mono>. Dashed return: <Mono>B --{'>'} A: label</Mono>.</P>
        </DiagramSection>

        {/* quadrant */}
        <DiagramSection
          id="diagram-quadrant"
          title="quadrant — Quadrant Chart"
          description="2D scatter plot divided into four quadrants. Points are placed with normalized x/y values (0–1) and auto-colored by quadrant."
          configRows={[
            ...COMMON_CONFIG,
            ['x-axis', 'Label: Low .. High', 'required'],
            ['y-axis', 'Label: Low .. High', 'required'],
            ['quadrant-1..4', 'corner labels (TL, TR, BL, BR)', 'required'],
          ]}
          markdownExample={QUADRANT_MD}
        >
          <P>Points: <Mono>Label: x, y</Mono> where x and y are between 0 and 1.</P>
        </DiagramSection>

        {/* gantt */}
        <DiagramSection
          id="diagram-gantt"
          title="gantt — Gantt Chart"
          description="Project timeline with task bars, optional section grouping, and milestone markers. Time axis ticks auto-adjust to the date range (weekly/monthly/quarterly)."
          configRows={[
            ...COMMON_CONFIG,
            ['section', 'group header', '—'],
            ['milestone', 'Label, yyyy-mm-dd', '—'],
          ]}
          markdownExample={GANTT_MD}
        >
          <P>Task format: <Mono>Label: id, yyyy-mm-dd, yyyy-mm-dd</Mono>. Milestone: <Mono>milestone: Label, yyyy-mm-dd</Mono>.</P>
        </DiagramSection>

        {/* state */}
        <DiagramSection
          id="diagram-state"
          title="state — State Machine"
          description="UML state machine with start (●) and end (◎) pseudo-states, labeled transitions, accent states, and animated dashed edges."
          configRows={[
            ...COMMON_CONFIG,
            ['accent', 'state id to highlight', '—'],
          ]}
          markdownExample={STATE_MD}
        >
          <P>Reserved IDs: <Mono>start</Mono> and <Mono>end</Mono>. Transition: <Mono>A --{'>'} B: event</Mono>. Accent: <Mono>accent: stateId</Mono>.</P>
        </DiagramSection>

        {/* er */}
        <DiagramSection
          id="diagram-er"
          title="er — Entity-Relationship Diagram"
          description="Database schema with entity boxes, field lists (pk/fk markers), and relationship lines with cardinality annotations."
          configRows={[
            ...COMMON_CONFIG,
          ]}
          markdownExample={ER_MD}
        >
          <P>Entity: <Mono>entity Name</Mono> followed by indented <Mono>{'  fieldName [pk|fk]: type'}</Mono> lines. Relation: <Mono>A --{'>'} B: label</Mono>.</P>
        </DiagramSection>

        {/* timeline */}
        <DiagramSection
          id="diagram-timeline"
          title="timeline — Timeline"
          description="Horizontal date axis with events spaced proportionally. Labels alternate above and below to reduce collisions. Milestones render with a larger accent dot."
          configRows={[
            ...COMMON_CONFIG,
          ]}
          markdownExample={TIMELINE_MD}
        >
          <P>Event: <Mono>yyyy-mm-dd: Label</Mono>. Milestone: append <Mono>milestone</Mono> at the end of the line.</P>
        </DiagramSection>

        {/* swimlane */}
        <DiagramSection
          id="diagram-swimlane"
          title="swimlane — Swimlane Flow"
          description="Cross-functional flowchart with horizontal lane bands. Same-lane edges use straight paths; cross-lane edges use S-curve routing. Edges animate with flowing dashes."
          configRows={[
            ...COMMON_CONFIG,
          ]}
          markdownExample={SWIMLANE_MD}
        >
          <P>Lanes are declared with <Mono>section Name</Mono>. Nodes within a section use the same node notation as <Mono>flow</Mono>. Cross-lane edges are automatically detected and routed.</P>
        </DiagramSection>

        {/* bubble */}
        <DiagramSection
          id="diagram-bubble"
          title="bubble — Bubble Chart"
          description="Packed-bubble chart where each item's area is proportional to its value. Positions are computed automatically by a greedy circle-packing algorithm — no coordinates needed. Each bubble pulses with a staggered SMIL animation."
          configRows={[
            ...COMMON_CONFIG,
          ]}
          markdownExample={BUBBLE_MD}
        >
          <P>Data lines use the format <Mono>Label: value</Mono> (positive numbers only). Bubble area is proportional to value; the largest item always fills the maximum radius. Labels and formatted values are rendered inside each bubble with automatic contrast (white or dark text).</P>
        </DiagramSection>

        {/* ═══════════════ 4. FRAMEWORKS ═══════════════════════════════ */}
        <section aria-labelledby="frameworks">
          <H2 id="frameworks">Framework Integration</H2>
          <P>ai-figure generates a plain SVG string — there is no special adapter needed. Below are minimal integration examples for common environments.</P>

          <H3 id="framework-html">HTML (via CDN or bundler)</H3>
          <CodeBlock language="html">{`<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { fig } from 'https://esm.sh/ai-figure';

    const svg = fig(\`
      figure flow
      direction: LR
      A[Start] --> B[Process] --> C[End]
    \`);

    document.getElementById('chart').innerHTML = svg;
  </script>
</head>
<body>
  <div id="chart"></div>
</body>
</html>`}</CodeBlock>

          <H3 id="framework-react">React</H3>
          <CodeBlock language="typescript">{`import { fig } from 'ai-figure';

// Server Component (Next.js App Router) — runs at build / request time
export default function FlowDiagram() {
  const svg = fig(\`
    figure flow
    direction: LR
    palette: antv
    A[Start] --> B[Process] --> C[End]
  \`);

  return (
    <div
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{ width: '100%' }}
    />
  );
}`}</CodeBlock>
          <CodeBlock language="typescript">{`import { fig } from 'ai-figure';
import { useMemo } from 'react';

// Client Component — re-renders when markdown changes
export function DiagramViewer({ markdown }: { markdown: string }) {
  const svg = useMemo(() => fig(markdown), [markdown]);

  return (
    <div
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{ width: '100%' }}
    />
  );
}`}</CodeBlock>

          <H3 id="framework-vue">Vue 3</H3>
          <CodeBlock language="html">{`<template>
  <div v-html="svg" />
</template>

<script setup lang="ts">
import { fig } from 'ai-figure';
import { computed } from 'vue';

const props = defineProps<{ markdown: string }>();

const svg = computed(() => fig(props.markdown));
</script>`}</CodeBlock>

          <H3 id="framework-nodejs">Node.js</H3>
          <CodeBlock language="typescript">{`import { fig } from 'ai-figure';
import { writeFileSync } from 'fs';

// Write to SVG file
const svg = fig(\`
  figure arch
  direction: TB
  title: Microservices
  layer API Gateway
    gw[Gateway]
  layer Services
    users[Users]
    orders[Orders]
    payments[Payments]
  layer Data
    db[PostgreSQL]
    cache[Redis]
\`);

writeFileSync('architecture.svg', svg);

// Express route example
import express from 'express';
const app = express();

app.get('/diagram', (req, res) => {
  const svg = fig(req.query.md as string);
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});`}</CodeBlock>
        </section>

        {/* ═══════════════ 5. AI SKILL ══════════════════════════════════ */}
        <section aria-labelledby="skill">
          <H2 id="skill">AI Agent Skill</H2>
          <P>
            ai-figure ships a <Mono>SKILL.md</Mono> file that AI agents (GitHub Copilot, Cursor, Claude, etc.) can load as context to generate diagrams autonomously — no additional prompting required.
          </P>

          <H3>GitHub Copilot</H3>
          <CodeBlock language="plaintext">{`# .github/copilot-instructions.md
@file node_modules/ai-figure/SKILL.md`}</CodeBlock>

          <H3>Cursor / Claude / other agents</H3>
          <CodeBlock language="plaintext">{`# In your prompt or system message:
Using the ai-figure SKILL.md at node_modules/ai-figure/SKILL.md,
create a sequence diagram showing the OAuth2 authorization code flow.`}</CodeBlock>

          <P>
            The Skill file contains the full markdown syntax reference, all config keys, JSON type definitions, and examples for every diagram type. It is designed to be compact and machine-readable while remaining human-friendly.
          </P>
        </section>
      </main>
    </div>
  );
}

