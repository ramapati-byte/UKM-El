// components/ui/PageHeader.tsx — Modern Page Hero Header with Sunrise Accent

import React from "react";
import Link from "next/link";
import type { BreadcrumbItem } from "../shell/AppShell";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: string;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  badge,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 ${className}`}
    >
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 p-0 m-0 list-none">
              <li>
                <Link
                  href="/"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
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
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
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

        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          {badge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-indigo-500/15 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              {badge}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0">{actions}</div>
      )}
    </div>
  );
}
