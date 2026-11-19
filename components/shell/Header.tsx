// components/shell/Header.tsx — Modern Glassmorphism Header

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getStoredTheme, toggleTheme, type ThemeMode } from "../../lib/theme";
import NotificationCenter from "../notification/NotificationCenter";
import OrgSwitcher from "../org/OrgSwitcher";
import { isMultiTenantEnabled } from "../../lib/tenant";

interface HeaderUser {
  name: string;
  email: string;
  role: string;
  foto_profil?: string;
}

interface HeaderProps {
  user: HeaderUser | null;
  onToggleSidebar?: () => void;
  onToggleMobile: () => void;
  onLogout: () => void;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({
  user,
  onToggleMobile,
  onLogout,
  title,
  subtitle,
  actions,
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

  const isSuperAdmin = user?.role?.toLowerCase() === "superadmin";

  return (
    <header className="h-18 px-4 sm:px-6 sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between transition-colors duration-200">
      {/* Sisi Kiri: Hamburger Mobile & Title */}
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Toggle mobile */}
        <button
          type="button"
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
          aria-label="Buka menu navigasi"
        >
          <i className="bi bi-list text-2xl" aria-hidden="true" />
        </button>

        {/* Title & Subtitle */}
        {title && (
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Sisi Kanan: OrgSwitcher + Actions + Notification + Theme + User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Additional Custom Actions slot */}
        {actions && <div className="hidden sm:flex items-center gap-2">{actions}</div>}

        {/* Org Switcher for Super Admin or when multi-tenant is enabled */}
        {(isSuperAdmin || isMultiTenantEnabled()) && (
          <div className="hidden md:block">
            <OrgSwitcher />
          </div>
        )}

        {/* Notifikasi Bell */}
        <NotificationCenter />

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={handleToggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
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

        {/* User Profile Pill */}
        {user ? (
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 rounded-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none"
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center uppercase shadow-xs">
                {user.name ? user.name.charAt(0) : "U"}
              </div>
              <div className="hidden sm:block text-left text-xs leading-none">
                <span className="font-semibold block truncate max-w-[120px] text-slate-800 dark:text-slate-100">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 capitalize mt-0.5 block">
                  {user.role}
                </span>
              </div>
              <i className="bi bi-chevron-down text-[10px] text-slate-400 ml-0.5" aria-hidden="true" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl shadow-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {user.email}
                  </p>
                  <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                    {user.role}
                  </span>
                </div>

                <div className="p-1">
                  <Link
                    href={
                      user.role === "mahasiswa"
                        ? "/mahasiswa/profil"
                        : user.role === "superadmin"
                        ? "/admin/dashboard"
                        : "/organizer/dashboard"
                    }
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <i className="bi bi-person text-sm text-slate-400" aria-hidden="true" /> Profil & Akun
                  </Link>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left transition-colors"
                  >
                    <i className="bi bi-box-arrow-right text-sm" aria-hidden="true" /> Keluar Akun
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="text-xs font-bold px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
          >
            Masuk
          </Link>
        )}
      </div>
    </header>
  );
}
