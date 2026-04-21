export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between text-sm text-slate-500">
        <span>
          ai-figure — MIT License
        </span>
        <a
          href="https://github.com/hustcc/ai-figure"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-slate-900 transition-colors"
        >
          GitHub ↗
        </a>
      </div>
    </footer>
  );
}
