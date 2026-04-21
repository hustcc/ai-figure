import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'ai-figure — SVG Diagram Generator',
    template: '%s — ai-figure',
  },
  description: 'Generate clean, self-contained SVG diagrams from a markdown string or JSON config. 10 diagram types, zero coordinates, streaming-safe. Works in browser and Node.js.',
  keywords: ['svg', 'diagram', 'flowchart', 'mermaid', 'ai', 'markdown', 'visualization'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
