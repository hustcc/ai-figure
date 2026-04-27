import type { Metadata } from 'next';
import { fig } from 'ai-figure';
import { DIAGRAMS } from '@/lib/diagrams';
import { encodeMarkdown } from '@/lib/encode';
import DiagramCard from '@/components/DiagramCard';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Browse diagram examples across all 11 types: flow, tree, architecture, sequence, quadrant, gantt, state, ER, timeline, swimlane, and bubble chart.',
};

export default function GalleryPage() {
  const cards = DIAGRAMS.flatMap((group) =>
    group.examples.map((ex) => {
      let svg = '';
      try {
        svg = fig(ex.markdown);
      } catch {
        svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60"><text x="10" y="35" font-size="12" fill="#94a3b8">Render error</text></svg>';
      }
      return {
        key: `${group.type}-${ex.title}`,
        title: `${group.label}: ${ex.title}`,
        svg,
        encoded: encodeMarkdown(ex.markdown),
      };
    })
  );

  // Shuffle cards so diagrams of the same type are not clustered together
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Gallery</h1>
        <p className="text-lg text-slate-500">
          {cards.length} examples across 11 diagram types. Click <strong className="text-slate-700">Copy link</strong> to get a shareable URL.
        </p>
      </div>

      {/* Type badges */}
      <div className="flex flex-wrap gap-2 mb-10">
        {DIAGRAMS.map((g) => (
          <span
            key={g.type}
            className="inline-flex items-center px-3 py-1 rounded-full border border-slate-200 bg-white text-sm text-slate-600 font-medium"
          >
            {g.label}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cards.map((card) => (
          <DiagramCard key={card.key} title={card.title} svg={card.svg} encoded={card.encoded} />
        ))}
      </div>
    </main>
  );
}
