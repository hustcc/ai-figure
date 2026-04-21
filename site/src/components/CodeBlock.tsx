import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash';
import xml from 'highlight.js/lib/languages/xml';
import plaintext from 'highlight.js/lib/languages/plaintext';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('text', plaintext);

interface Props {
  children: string;
  language?: string;
  label?: string;
  className?: string;
}

export default function CodeBlock({ children, language = 'plaintext', label, className = '' }: Props) {
  const highlighted = hljs.highlight(children.trim(), { language, ignoreIllegals: true });
  return (
    <div className={`rounded-xl overflow-hidden ${className}`}>
      {label && (
        <div className="bg-slate-800 px-4 py-1.5 text-xs font-mono text-slate-400 uppercase tracking-wider border-b border-slate-700">
          {label}
        </div>
      )}
      <pre className="bg-slate-900 p-5 text-sm leading-relaxed overflow-x-auto font-mono m-0">
        <code
          className={`hljs language-${language}`}
          dangerouslySetInnerHTML={{ __html: highlighted.value }}
        />
      </pre>
    </div>
  );
}
