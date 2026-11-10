// components/shell/PublicShell.tsx — Shell untuk halaman publik (tanpa sidebar)

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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Public Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brandLogo}
              alt="Logo"
              className="w-8 h-8 object-contain shrink-0 rounded"
            />
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100">
              {brandTitle}
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/events"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1.5 rounded-lg"
            >
              Katalog Event
            </Link>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={handleToggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={`Ganti tema (${theme})`}
              aria-label="Ganti tema"
            >
              {theme === "dark" ? (
                <i className="bi bi-moon-stars text-base text-amber-400" aria-hidden="true" />
              ) : theme === "auto" ? (
                <i className="bi bi-circle-half text-base text-indigo-500" aria-hidden="true" />
              ) : (
                <i className="bi bi-sun text-base text-amber-500" aria-hidden="true" />
              )}
            </button>

            {/* Auth CTA */}
            {user ? (
              <Link
                href={getDashboardHref()}
                className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-xs"
              >
                <i className="bi bi-speedometer2" aria-hidden="true" /> Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-xs"
              >
                <i className="bi bi-box-arrow-in-right" aria-hidden="true" /> Masuk
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">{children}</main>

      {/* Public Footer */}
      <Footer />
    </div>
  );
}
