import CopyButton from './CopyButton';

interface DiagramCardProps {
  title: string;
  svg: string;
  encoded: string;
}

export default function DiagramCard({ title, svg, encoded }: DiagramCardProps) {
  return (
    <article className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div
        className="p-4 [&>svg]:w-full [&>svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
        <span className="text-sm font-medium text-slate-700 truncate pr-2">{title}</span>
        <CopyButton encoded={encoded} />
      </div>
    </article>
  );
}
