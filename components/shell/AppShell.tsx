// components/shell/AppShell.tsx — Master Application Shell with Sunrise Mesh & Tactile Energy

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import LegacyBanner from "../migration/LegacyBanner";
import { getNavByRole, type NavSection } from "../../lib/navigation";
import { OrgProvider } from "../org/OrgContext";

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
  brandTitle = "BEM El Rahma",
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
  const pathname = usePathname();

  // Role ditentukan dari segmen URL atau fallback
  const urlRole = pathname.startsWith("/admin")
    ? "superadmin"
    : pathname.startsWith("/organizer")
      ? "penyelenggara"
      : pathname.startsWith("/mahasiswa")
        ? "mahasiswa"
        : null;

  const activeRole = urlRole || role || user?.role || "penyelenggara";
  const sections = navSections || getNavByRole(activeRole);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  // Primary links untuk Mobile Bottom Navigation (ambil 4-5 item pertama dari menu)
  const mobileBottomItems = sections.flatMap((s) => s.items).slice(0, 5);

  return (
    <OrgProvider>
    <div className="min-h-screen bg-sunrise-mesh text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Shell Container */}
      <div className="flex-1 flex flex-row relative overflow-x-hidden">
        {/* Sidebar Component */}
        <Sidebar
          sections={sections}
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onCloseMobile={() => setMobileOpen(false)}
          brandTitle={brandTitle}
          userRole={activeRole}
          user={user}
        />

        {/* Main Content Area — margin-left kompensasi sidebar fixed di desktop */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-68"}`}>
          {/* Header */}
          <Header
            user={user}
            onToggleMobile={() => setMobileOpen(true)}
            onLogout={handleLogout}
            title={title}
            subtitle={subtitle}
            actions={actions}
          />

          {/* Legacy Migration Banner if enabled */}
          <LegacyBanner />

          {/* Page Content Header (Breadcrumbs + Title + Action Buttons) */}
          {(breadcrumbs || (title && !subtitle)) && (
            <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                {/* Breadcrumbs */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <nav aria-label="Breadcrumb" className="mb-2">
                    <ol className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 p-0 m-0 list-none">
                      <li>
                        <Link
                          href="/"
                          className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        >
                          <i className="bi bi-house-door" aria-hidden="true" />
                        </Link>
                      </li>
                      {breadcrumbs.map((b, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="text-slate-300 dark:text-slate-600">/</span>
                          {b.href ? (
                            <Link
                              href={b.href}
                              className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-medium"
                            >
                              {b.label}
                            </Link>
                          ) : (
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {b.label}
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </nav>
                )}
              </div>

              {actions && (
                <div className="flex items-center gap-2.5 shrink-0">{actions}</div>
              )}
            </div>
          )}

          {/* Main Body with smooth Entrance */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 pb-24 md:pb-8 w-full max-w-7xl mx-auto animate-fade-in-up">
            {children}
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (Dengan Aksen RedSun Glow) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 z-40 flex justify-around items-center h-16 px-1 shadow-[0_-4px_20px_rgba(244,63,94,0.06)]">
        {mobileBottomItems.map((item, index) => {
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href) &&
              item.href !== "/organizer/dashboard" &&
              item.href !== "/admin/dashboard" &&
              item.href !== "/mahasiswa/dashboard");

          return (
            <Link
              key={index}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center h-full space-y-1 relative transition-all duration-150 active:scale-95 ${
                isActive
                  ? "text-rose-600 dark:text-rose-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {/* Active top glowing indicator bar */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 rounded-b-full shadow-xs" />
              )}
              <div className="shrink-0 flex items-center justify-center">
                <i className={`bi ${item.icon} text-lg leading-none`} />
              </div>
              <span className="text-[10px] font-semibold tracking-tight truncate max-w-[62px] text-center leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Menu drawer trigger if there are more items */}
        {sections.flatMap((s) => s.items).length > 5 && (
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex flex-1 flex-col items-center justify-center h-full space-y-1 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 active:scale-95 transition-colors"
          >
            <i className="bi bi-grid text-lg leading-none" />
            <span className="text-[10px] font-semibold tracking-tight text-center leading-none">
              Lainnya
            </span>
          </button>
        )}
      </nav>
    </div>
    </OrgProvider>
  );
}
