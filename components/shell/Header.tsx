// components/shell/Header.tsx — Navbar atas kanonik AdminLTE 4
// Fitur: toggle sidebar, judul/breadcrumb, theme switcher, notifikasi, profil

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getStoredTheme, toggleTheme, type ThemeMode } from "../../lib/theme";

interface HeaderUser {
  name: string;
  email: string;
  role: string;
  foto_profil?: string;
}

interface HeaderProps {
  user: HeaderUser | null;
  onToggleSidebar: () => void;
  onToggleMobile: () => void;
  onLogout: () => void;
  title?: string;
  subtitle?: string;
}

export default function Header({
  user,
  onToggleSidebar,
  onToggleMobile,
  onLogout,
  title,
  subtitle,
}: HeaderProps) {
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    if (!profileOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("click", handleOutside);
    return () => document.removeEventListener("click", handleOutside);
  }, [profileOpen]);

  const handleToggleTheme = () => {
    const next = toggleTheme();
    setTheme(next);
  };

  return (
    <header className="app-header">
      {/* Sisi Kiri: Tombol Toggle & Judul */}
      <div className="flex items-center gap-3">
        {/* Toggle mobile */}
        <button
          type="button"
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
          aria-label="Buka menu navigasi"
        >
          <i className="bi bi-list text-xl" aria-hidden="true" />
        </button>

        {/* Toggle desktop (sidebar collapse) */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden lg:flex p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
          aria-label="Kecilkan/Perbesar sidebar"
        >
          <i className="bi bi-layout-sidebar text-lg" aria-hidden="true" />
        </button>

        {/* Judul & Subtitle */}
        {title && (
          <div className="hidden sm:block ml-1">
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Sisi Kanan: Aksi (Theme, Notifikasi, User) */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={handleToggleTheme}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Ganti tema (saat ini: ${theme})`}
          aria-label="Ganti mode gelap/terang"
        >
          {theme === "dark" ? (
            <i className="bi bi-moon-stars text-base text-amber-400" aria-hidden="true" />
          ) : theme === "auto" ? (
            <i className="bi bi-circle-half text-base text-indigo-500" aria-hidden="true" />
          ) : (
            <i className="bi bi-sun text-base text-amber-500" aria-hidden="true" />
          )}
        </button>

        {/* Notifikasi Bell (Placeholder) */}
        <button
          type="button"
          className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Notifikasi"
        >
          <i className="bi bi-bell text-base" aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>

        {/* User Profile Dropdown */}
        {user ? (
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 p-1 pl-2 pr-2.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all focus:outline-none"
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                {user.name ? user.name.charAt(0) : "U"}
              </div>
              <div className="hidden md:block text-left text-xs leading-none">
                <span className="font-semibold block truncate max-w-[120px] text-slate-800 dark:text-slate-200">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                  {user.role}
                </span>
              </div>
              <i className="bi bi-chevron-down text-[10px] text-slate-400" aria-hidden="true" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
                <Link
                  href="/mahasiswa/profil"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <i className="bi bi-person text-sm" aria-hidden="true" /> Profil Saya
                </Link>
                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left"
                >
                  <i className="bi bi-box-arrow-right text-sm" aria-hidden="true" /> Keluar Akun
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Masuk
          </Link>
        )}
      </div>
    </header>
  );
}
