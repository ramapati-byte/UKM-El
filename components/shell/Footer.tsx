// components/shell/Footer.tsx — Footer kanonik AdminLTE 4

export default function Footer() {
  return (
    <footer className="app-footer flex flex-col sm:flex-row items-center justify-between gap-2">
      <div>
        <span>&copy; 2026 </span>
        <strong className="text-slate-700 dark:text-slate-300">
          Sistem Pengelolaan UKM
        </strong>
        <span> — BEM El Rahma. Hak cipta dilindungi.</span>
      </div>
      <div className="text-xs text-slate-400 dark:text-slate-500">
        <b>Versi</b> 2.1.0
      </div>
    </footer>
  );
}
