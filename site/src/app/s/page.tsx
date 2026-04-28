'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { fig } from 'ai-figure';
import { decodeMarkdown, encodeMarkdownBrowser } from '@/lib/decode';
import Link from 'next/link';
import CopyButton from '@/components/CopyButton';
import FigEditor from '@/components/FigEditor';

const DECODE_TIMEOUT_MS = 10_000;
const ENCODE_DEBOUNCE_MS = 400;

export default function SharedDiagramPage() {
  const [svg, setSvg] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [encoded, setEncoded] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const encodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending encode timer on unmount to avoid state updates on an unmounted component.
  useEffect(() => {
    return () => {
      if (encodeTimerRef.current) clearTimeout(encodeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) {
      setError('No diagram encoded in the URL hash.');
      setLoading(false);
      return;
    }
    setEncoded(hash);
    let rejectTimeout: (() => void) | null = null;
    const timeoutId = setTimeout(() => rejectTimeout?.(), DECODE_TIMEOUT_MS);
    const timeout = new Promise<never>((_, reject) => {
      rejectTimeout = () => reject(new Error('Timed out decoding diagram.'));
    });
    Promise.race([decodeMarkdown(hash), timeout])
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

  const handleCodeChange = useCallback((newMarkdown: string) => {
    setMarkdown(newMarkdown);

    // Re-render the SVG immediately
    try {
      setSvg(fig(newMarkdown));
    } catch {
      // keep the previous SVG while the markdown is invalid
    }

    // Debounce URL hash + copy-link update so it doesn't thrash on every keystroke
    if (encodeTimerRef.current) clearTimeout(encodeTimerRef.current);
    encodeTimerRef.current = setTimeout(() => {
      encodeMarkdownBrowser(newMarkdown)
        .then((hash) => {
          setEncoded(hash);
          window.location.hash = hash;
        })
        .catch(() => {/* ignore */});
    }, ENCODE_DEBOUNCE_MS);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid lg:grid-cols-2 gap-6 items-start">
            {/* SVG preview */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-4">Output</p>
              <div
                className="overflow-x-auto [&>svg]:block [&>svg]:mx-auto [&>svg]:max-w-full [&>svg]:h-auto"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>

            {/* Editable markdown source */}
            <div className="min-w-0">
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-4">Markdown source</p>
              <FigEditor value={markdown} onChange={handleCodeChange} />
              <div className="mt-4 flex flex-wrap items-center gap-3">
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
                {encoded && <CopyButton encoded={encoded} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
