export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-100 px-6 py-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-slate-800">LocalLeads</span>
          <span className="text-slate-300">·</span>
          <span className="text-sm text-slate-400">© 2025</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="/legal" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Mentions légales</a>
          <a href="/contact" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Contact</a>
          <a href="/#faq" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">FAQ</a>
        </div>
        <p className="text-xs text-slate-400">Fait avec ☕ en France</p>
      </div>
    </footer>
  );
}