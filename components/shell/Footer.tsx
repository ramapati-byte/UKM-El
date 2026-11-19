// components/shell/Footer.tsx — Modern Minimal Footer

export default function Footer() {
  return (
    <footer className="mt-auto px-6 py-4 border-t border-slate-200/70 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/40 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-medium text-slate-700 dark:text-slate-300">
          Sistem Pengelolaan UKM
        </span>
        <span className="text-slate-400">&bull;</span>
        <span>BEM El Rahma</span>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500">
        <span>&copy; {new Date().getFullYear()} Hak Cipta Dilindungi</span>
        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
          v2.5 Professional
        </span>
      </div>
    </footer>
  );
}
