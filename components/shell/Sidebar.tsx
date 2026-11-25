// components/shell/Sidebar.tsx — Modern Sleek Sidebar with Sunrise RedSun Energy

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavSection } from "../../lib/navigation";

interface SidebarProps {
  sections: NavSection[];
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile: () => void;
  brandTitle?: string;
  brandLogo?: string;
  userRole?: string;
  user?: { name: string; email: string; role: string } | null;
}

function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

function matchesPath(pathname: string, href: string): boolean {
  const path = normalizePath(pathname);
  const target = normalizePath(href);
  return path === target || path.startsWith(`${target}/`);
}

export default function Sidebar({
  sections,
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  brandTitle = "BEM El Rahma",
  brandLogo = "/logo-bem.png",
  userRole,
  user,
}: SidebarProps) {
  const pathname = usePathname();

  // Item navigasi dengan prefix terpanjang yang cocok dengan URL aktif
  const activeHref = sections
    .flatMap((sec) => sec.items)
    .reduce<string | null>((best, item) => {
      if (!matchesPath(pathname, item.href)) return best;
      if (!best || item.href.length > best.length) return item.href;
      return best;
    }, null);

  const getRoleLabel = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "superadmin":
        return "Super Admin";
      case "penyelenggara":
        return "Pengurus UKM";
      case "mahasiswa":
        return "Mahasiswa";
      default:
        return "Portal Kampus";
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 inset-y-0 left-0 z-40 flex flex-col h-screen shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 ease-in-out ${
          collapsed ? "lg:w-20 w-20" : "lg:w-68 w-68"
        } ${
          mobileOpen
            ? "translate-x-0 w-72 shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0 relative">
          <Link
            href="/"
            className="flex items-center gap-3 overflow-hidden text-decoration-none group"
          >
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-rose-500/25 to-indigo-600/30 border border-rose-200/80 dark:border-rose-800/60 flex items-center justify-center p-1.5 shrink-0 transition-transform duration-200 group-hover:scale-105 group-hover:rotate-2 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brandLogo}
                alt="Logo"
                className="w-full h-full object-contain drop-shadow-xs"
              />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 shadow-2xs" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100 truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  {brandTitle}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 leading-tight">
                    {getRoleLabel(userRole || user?.role)}
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* Close button on Mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Tutup sidebar"
          >
            <i className="bi bi-x-lg text-base" aria-hidden="true" />
          </button>
        </div>

        {/* Floating Circular Toggle Button on Desktop */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
            className="hidden lg:flex absolute -right-3.5 top-6 w-7 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-xs items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-600 transition-all z-30 active:scale-95"
          >
            <i
              className={`bi ${collapsed ? "bi-chevron-right" : "bi-chevron-left"} text-[10px]`}
              aria-hidden="true"
            />
          </button>
        )}

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 custom-scrollbar overflow-x-hidden">
          {sections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {(!collapsed || mobileOpen) && (
                <p className="px-3.5 text-[10px] font-bold tracking-[0.16em] text-slate-400 dark:text-slate-500 uppercase mb-2 flex items-center justify-between">
                  <span>{sec.section}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                </p>
              )}
              <ul className="space-y-1 list-none p-0 m-0">
                {sec.items.map((item, iIdx) => {
                  const isActive = item.href === activeHref;

                  return (
                    <li key={iIdx}>
                      <Link
                        href={item.href}
                        onClick={() => onCloseMobile()}
                        aria-current={isActive ? "page" : undefined}
                        title={collapsed && !mobileOpen ? item.label : undefined}
                        className={`group relative flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                          collapsed && !mobileOpen
                            ? "px-0 justify-center"
                            : "px-3.5 justify-start"
                        } ${
                          isActive
                            ? "bg-gradient-to-r from-rose-50/80 via-indigo-50/90 to-indigo-50/70 dark:from-rose-950/40 dark:via-indigo-950/60 dark:to-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs border border-rose-100/60 dark:border-rose-900/30"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                        }`}
                      >
                        {/* Sunrise Glow Left Accent Bar for Active Item */}
                        {isActive && (!collapsed || mobileOpen) && (
                          <span
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-gradient-to-b from-amber-500 via-rose-500 to-indigo-600 rounded-r-full shadow-2xs"
                            aria-hidden="true"
                          />
                        )}

                        {/* Icon */}
                        <div
                          className={`shrink-0 flex items-center justify-center transition-transform duration-150 group-hover:scale-110 ${
                            isActive
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                          }`}
                        >
                          <i className={`bi ${item.icon} text-base`} aria-hidden="true" />
                        </div>

                        {/* Label */}
                        {(!collapsed || mobileOpen) && (
                          <span className="truncate text-sm whitespace-nowrap">
                            {item.label}
                          </span>
                        )}

                        {/* Active Arrow Indicator */}
                        {isActive && (!collapsed || mobileOpen) && (
                          <i
                            className="bi bi-chevron-right ml-auto text-[11px] text-rose-500 dark:text-rose-400 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Sidebar Footer User Card (when expanded) */}
        {(!collapsed || mobileOpen) && user && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-gradient-to-r from-amber-50/50 via-rose-50/40 to-indigo-50/50 dark:from-slate-800/60 dark:to-slate-800/40 border border-rose-100/70 dark:border-slate-700/60 shadow-2xs">
              <div className="relative w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-none">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-1">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
