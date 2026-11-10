// components/shell/Sidebar.tsx — Sidebar kanonik AdminLTE 4
// Struktur: app-sidebar > sidebar-brand + sidebar-wrapper > sidebar-menu

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavSection } from "../../lib/navigation";

interface SidebarProps {
  sections: NavSection[];
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  brandTitle?: string;
  brandLogo?: string;
}

export default function Sidebar({
  sections,
  collapsed,
  mobileOpen,
  onCloseMobile,
  brandTitle = "BEM El Rahma",
  brandLogo = "/logo-bem.png",
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`app-sidebar fixed lg:static inset-y-0 left-0 z-50 flex flex-col shrink-0 transition-all duration-300 ease-in-out ${
          collapsed ? "lg:w-[70px]" : "lg:w-[250px]"
        } ${
          mobileOpen
            ? "translate-x-0 w-[260px] shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* sidebar-brand */}
        <div className="sidebar-brand justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 overflow-hidden text-decoration-none group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brandLogo}
              alt="Logo"
              className="w-8 h-8 object-contain shrink-0 rounded transition-transform group-hover:scale-105"
            />
            {(!collapsed || mobileOpen) && (
              <span className="font-bold text-base tracking-tight truncate text-slate-800 dark:text-slate-100">
                {brandTitle}
              </span>
            )}
          </Link>

          {/* Tombol tutup di mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Tutup menu sidebar"
          >
            <i className="bi bi-x-lg text-lg" aria-hidden="true" />
          </button>
        </div>

        {/* sidebar-wrapper */}
        <div className="sidebar-wrapper scrollbar-hide">
          <nav className="sidebar-menu space-y-6" aria-label="Navigasi Utama">
            {sections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {(!collapsed || mobileOpen) && (
                  <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                    {sec.section}
                  </p>
                )}
                <ul className="space-y-1 list-none p-0 m-0">
                  {sec.items.map((item, iIdx) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/organizer/dashboard" &&
                        item.href !== "/admin/dashboard" &&
                        item.href !== "/mahasiswa/dashboard" &&
                        pathname.startsWith(item.href));

                    return (
                      <li key={iIdx}>
                        <Link
                          href={item.href}
                          onClick={() => onCloseMobile()}
                          title={collapsed && !mobileOpen ? item.label : undefined}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            collapsed && !mobileOpen
                              ? "justify-center"
                              : "justify-start"
                          } ${
                            isActive
                              ? "bg-indigo-600 text-white shadow-xs font-semibold"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          <i
                            className={`bi ${item.icon} text-base shrink-0 ${
                              isActive ? "text-white" : "text-slate-400 dark:text-slate-400"
                            }`}
                            aria-hidden="true"
                          />
                          {(!collapsed || mobileOpen) && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
