// components/ui/EmptyState.tsx — Tampilan status kosong AdminLTE 4

import React from "react";

export interface EmptyStateProps {
  icon?: string; // class Bootstrap Icons, default "bi-inbox"
  title: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon = "bi-inbox",
  title,
  message,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`text-center py-12 px-4 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3.5 text-2xl">
        <i className={`bi ${icon}`} aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
        {title}
      </h3>
      {message && (
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4 leading-relaxed">
          {message}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
