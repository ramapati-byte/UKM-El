// components/ui/PageHeader.tsx — Header halaman AdminLTE 4 dengan breadcrumbs & aksi

import React from "react";
import Link from "next/link";
import type { BreadcrumbItem } from "../shell/AppShell";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 ${className}`}
    >
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-1.5">
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
                    <Link
                      href={b.href}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400"
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

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
