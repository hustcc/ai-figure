import type { Metadata } from 'next';
import Link from 'next/link';
import { fig } from 'ai-figure';
import CodeBlock from '@/components/CodeBlock';

export const metadata: Metadata = {
  title: 'ai-figure — SVG Diagram Generator',
  description: 'Generate clean, self-contained SVG diagrams from a markdown string. 11 diagram types, zero coordinates, AI-friendly.',
};

const EXAMPLE_MD = `figure flow
direction: LR
palette: antv
title: CI Pipeline
code[Push Code] --> lint{Lint?}
lint --> test[Run Tests]: pass
lint --> fix((Fix)): fail
fix --> code
test --> build[Build Image]
build --> deploy[Deploy]
group Pipeline: code, lint, test, build`;

const FEATURES = [
  {
    icon: '⚡',
    title: 'Streaming-safe',
    description: 'Partial or empty input returns a valid empty SVG. Works perfectly with AI streaming responses.',
  },
  {
    icon: '📐',
    title: '11 diagram types',
    description: 'Flow, tree, arch, sequence, quadrant, gantt, state, ER, timeline, swimlane, and bubble chart.',
  },
  {
    icon: '✍️',
    title: 'Zero coordinates',
    description: 'Describe your diagram in markdown — layout is computed automatically.',
  },
  {
    icon: '🎨',
    title: 'Nine palettes',
    description: 'default, antv, drawio, figma, vega, mono-blue, mono-green, mono-purple, mono-orange.',
  },
];

const INSTALL_CODE = `npm install ai-figure`;

const USAGE_CODE = `import { fig } from 'ai-figure';

const svg = fig(\`
  figure flow
  direction: LR
  A[Start] --> B[End]
\`);

// Browser
document.getElementById('chart').innerHTML = svg;

// Node.js
import { writeFileSync } from 'fs';
writeFileSync('diagram.svg', svg);`;

export default function HomePage() {
  const exampleSvg = fig(EXAMPLE_MD);
  return (
    <main>
      {/* Hero */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-sm font-medium px-3 py-1 rounded-full border border-orange-100 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block"></span>
            v0.3 &mdash; 11 diagram types
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-5">
            SVG diagrams from<br />
            <span className="text-orange-500">plain markdown</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-10">
            Single function call. No coordinates, no config hell.
            Just describe your diagram and get beautiful, self-contained SVG.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              View Gallery
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-semibold px-6 py-3 rounded-lg border border-slate-200 transition-colors"
            >
              Read Docs
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-slate-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Example */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">See it in action</h2>
          <p className="text-slate-500">Write markdown on the left, get SVG on the right.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          <CodeBlock label="Input" language="plaintext">{EXAMPLE_MD}</CodeBlock>
          <div className="flex flex-col">
            <div className="bg-slate-800 rounded-t-xl px-4 py-1.5 text-xs font-mono text-slate-400 uppercase tracking-wider border-b border-slate-700">
              Output
            </div>
            <div
              className="flex-1 bg-white rounded-b-xl border-x border-b border-slate-200 p-4 [&>svg]:w-full [&>svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: exampleSvg }}
            />
          </div>
        </div>
      </section>

      {/* Install + Usage */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="flex flex-col gap-6">
          <CodeBlock label="Install" language="bash">{INSTALL_CODE}</CodeBlock>
          <CodeBlock label="Usage" language="typescript">{USAGE_CODE}</CodeBlock>
        </div>
      </section>
    </main>
  );
}

