// components/shell/PublicShell.tsx — Modern Clean Public Portal Shell with Sunrise Glow

"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "./Footer";
import { getStoredTheme, toggleTheme, type ThemeMode } from "../../lib/theme";

interface PublicShellProps {
  children: React.ReactNode;
  brandTitle?: string;
  brandLogo?: string;
}

export default function PublicShell({
  children,
  brandTitle = "Sistem Event Kampus",
  brandLogo = "/logo-bem.png",
}: PublicShellProps) {
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());
  const [user] = useState<{ name: string; role: string } | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return null;
  });

  const handleToggleTheme = () => {
    const next = toggleTheme();
    setTheme(next);
  };

  const getDashboardHref = () => {
    if (!user) return "/login";
    if (user.role === "superadmin") return "/admin/dashboard";
    if (user.role === "penyelenggara") return "/organizer/dashboard";
    return "/mahasiswa/dashboard";
  };

  return (
    <div className="min-h-screen flex flex-col bg-sunrise-mesh text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Public Navbar */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-rose-500/25 to-indigo-600/30 border border-rose-200/80 dark:border-rose-800/60 flex items-center justify-center p-1.5 shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brandLogo}
                alt="Logo"
                className="w-full h-full object-contain drop-shadow-xs"
              />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 shadow-2xs" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                {brandTitle}
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                BEM El Rahma
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/events"
              className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 px-3.5 py-2 rounded-xl hover:bg-rose-50/70 dark:hover:bg-slate-800/60 transition-colors"
            >
              Katalog Event
            </Link>

            <Link
              href="/ukm"
              className="hidden sm:inline-flex text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 px-3.5 py-2 rounded-xl hover:bg-rose-50/70 dark:hover:bg-slate-800/60 transition-colors"
            >
              Direktori UKM
            </Link>

            <Link
              href="/berita"
              className="hidden sm:inline-flex text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 px-3.5 py-2 rounded-xl hover:bg-rose-50/70 dark:hover:bg-slate-800/60 transition-colors"
            >
              Berita
            </Link>

            {/* Theme Toggle with playful rotate */}
            <button
              type="button"
              onClick={handleToggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-200 hover:rotate-12 focus:outline-none"
              title={`Ganti tema (${theme})`}
              aria-label="Ganti tema"
            >
              {theme === "dark" ? (
                <i className="bi bi-moon-stars text-base text-amber-400" aria-hidden="true" />
              ) : theme === "auto" ? (
                <i className="bi bi-circle-half text-base text-indigo-500" aria-hidden="true" />
              ) : (
                <i className="bi bi-sun-fill text-base text-amber-500" aria-hidden="true" />
              )}
            </button>

            {/* Auth CTA with Sunrise Gradient */}
            {user ? (
              <Link
                href={getDashboardHref()}
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white hover:from-amber-600 hover:to-indigo-700 shadow-sm shadow-rose-500/20 transition-all active:scale-95"
              >
                <i className="bi bi-speedometer2" aria-hidden="true" /> Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white hover:from-amber-600 hover:to-indigo-700 shadow-sm shadow-rose-500/20 transition-all active:scale-95"
              >
                <i className="bi bi-box-arrow-in-right" aria-hidden="true" /> Masuk
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
