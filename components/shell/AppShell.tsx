// components/shell/AppShell.tsx — Shell aplikasi utama AdminLTE 4
// Struktur: app-wrapper > app-sidebar + app-main (app-header + app-content-header + app-content + app-footer)

"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { getNavByRole, type NavSection } from "../../lib/navigation";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  navSections?: NavSection[];
  role?: string;
  brandTitle?: string;
}

export default function AppShell({
  children,
  title,
  subtitle,
  breadcrumbs,
  actions,
  navSections,
  role,
  brandTitle,
}: AppShellProps) {
  const [user] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return {
      name: "Pengurus UKM",
      email: "pengurus@elrahma.ac.id",
      role: "penyelenggara",
    };
  });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeRole = role || user?.role || "penyelenggara";
  const sections = navSections || getNavByRole(activeRole);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  return (
    <div className="app-wrapper flex-row min-h-screen">
      {/* Sidebar Region */}
      <Sidebar
        sections={sections}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        brandTitle={brandTitle}
      />

      {/* Main Region */}
      <div className="app-main flex-1 flex flex-col min-w-0">
        {/* Header Region */}
        <Header
          user={user}
          onToggleSidebar={() => setCollapsed((v) => !v)}
          onToggleMobile={() => setMobileOpen((v) => !v)}
          onLogout={handleLogout}
          title={title}
          subtitle={subtitle}
        />

        {/* Content Header (Breadcrumbs & Page Title + Actions) */}
        {(title || breadcrumbs || actions) && (
          <div className="app-content-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {/* Breadcrumbs */}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav aria-label="Breadcrumb" className="mb-1">
                  <ol className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 p-0 m-0 list-none">
                    <li>
                      <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                        <i className="bi bi-house-door" aria-hidden="true" />
                      </Link>
                    </li>
                    {breadcrumbs.map((b, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="text-slate-300 dark:text-slate-600">/</span>
                        {b.href ? (
                          <Link href={b.href} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                            {b.label}
                          </Link>
                        ) : (
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {b.label}
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              {/* Title & Subtitle */}
              {title && (
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Actions Slot */}
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
          </div>
        )}

        {/* Content Region (Container-fluid) */}
        <main className="app-content flex-1">
          <div className="w-full">{children}</div>
        </main>

        {/* Footer Region */}
        <Footer />
      </div>
    </div>
  );
}
