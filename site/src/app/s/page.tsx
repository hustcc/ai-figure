'use client';

import { useEffect, useState } from 'react';
import { fig } from 'ai-figure';
import { decodeMarkdown } from '@/lib/decode';
import Link from 'next/link';

const DECODE_TIMEOUT_MS = 10_000;

export default function SharedDiagramPage() {
  const [svg, setSvg] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const encoded = window.location.hash.replace(/^#/, '');
    if (!encoded) {
      setError('No diagram encoded in the URL hash.');
      setLoading(false);
      return;
    }
    let rejectTimeout: (() => void) | null = null;
    const timeoutId = setTimeout(() => rejectTimeout?.(), DECODE_TIMEOUT_MS);
    const timeout = new Promise<never>((_, reject) => {
      rejectTimeout = () => reject(new Error('Timed out decoding diagram.'));
    });
    Promise.race([decodeMarkdown(encoded), timeout])
      .then((md) => {
        setMarkdown(md);
        setSvg(fig(md));
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to render diagram');
      })
      .finally(() => setLoading(false));
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <main>
      {loading ? (
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <p className="text-slate-400 text-sm animate-pulse">Rendering diagram…</p>
        </div>
      ) : error ? (
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <p className="text-slate-400 text-sm mb-2 font-mono">Error</p>
          <p className="text-slate-600">{error}</p>
          <Link
            href="/gallery"
            className="mt-6 inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            ← Back to Gallery
          </Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid lg:grid-cols-2 gap-6 items-start">
            {/* SVG preview */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-4">Output</p>
              <div
                className="[&>svg]:w-full [&>svg]:h-auto"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>

            {/* Markdown source */}
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-4">Markdown source</p>
              <pre className="bg-slate-900 text-slate-100 rounded-xl p-5 text-sm leading-relaxed font-mono overflow-x-auto whitespace-pre">
                <code>{markdown}</code>
              </pre>
              <div className="mt-4 flex items-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Try ai-figure
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-lg border border-slate-200 transition-colors text-sm"
                >
                  View Docs
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
