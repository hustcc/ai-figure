import { codeToHtml } from 'shiki';
import { highlight } from '@/lib/figHighlight';

interface Props {
  children: string;
  language?: string;
  label?: string;
  className?: string;
}

export default async function CodeBlock({ children, language = 'text', label, className = '' }: Props) {
  let html: string;
  if (language === 'figmd') {
    const highlighted = highlight(children.trim());
    html = `<pre style="background:#0f172a" class="text-slate-100"><code>${highlighted}</code></pre>`;
  } else {
    html = await codeToHtml(children.trim(), {
      lang: language,
      theme: 'one-dark-pro',
      colorReplacements: { '#282c34': '#0f172a' },
    });
  }
  return (
    <div className={`rounded-xl overflow-hidden ${className}`}>
      {label && (
        <div className="bg-slate-800 px-4 py-1.5 text-xs font-mono text-slate-400 uppercase tracking-wider border-b border-slate-700">
          {label}
        </div>
      )}
      <div
        className="[&>pre]:p-5 [&>pre]:m-0 [&>pre]:text-sm [&>pre]:leading-relaxed [&>pre]:overflow-x-auto [&>pre]:font-mono [&>pre]:rounded-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
