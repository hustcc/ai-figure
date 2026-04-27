import Link from 'next/link';
import CopyButton from './CopyButton';

interface DiagramCardProps {
  title: string;
  svg: string;
  encoded: string;
}

export default function DiagramCard({ title, svg, encoded }: DiagramCardProps) {
  return (
    <article className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <Link href={`/s#${encoded}`} className="block p-4 [&>svg]:w-full [&>svg]:h-auto hover:bg-slate-50 transition-colors">
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      </Link>
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
        <span className="text-sm font-medium text-slate-700 truncate pr-2">{title}</span>
        <CopyButton encoded={encoded} />
      </div>
    </article>
  );
}
