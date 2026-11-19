// components/ui/EmptyState.tsx — Modern Clean Empty State

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
      className={`text-center py-14 px-6 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center mx-auto mb-4 text-2xl shadow-xs">
        <i className={`bi ${icon}`} aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5 tracking-tight">
        {title}
      </h3>
      {message && (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
          {message}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
