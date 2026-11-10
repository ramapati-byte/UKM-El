// components/ui/LoadingSkeleton.tsx — Skeleton loading AdminLTE 4

import React from "react";

export interface LoadingSkeletonProps {
  variant?: "table" | "card" | "text" | "calendar";
  rows?: number;
  count?: number;
  className?: string;
}

export default function LoadingSkeleton({
  variant = "table",
  rows = 4,
  count = 3,
  className = "",
}: LoadingSkeletonProps) {
  if (variant === "text") {
    return (
      <div className={`space-y-2 animate-pulse ${className}`}>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse ${className}`}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3"
          >
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "calendar") {
    return (
      <div
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 animate-pulse ${className}`}
      >
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-4" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-slate-100 dark:bg-slate-800/60 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  // Default: table
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden animate-pulse ${className}`}
    >
      <div className="h-11 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800" />
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-2/5" />
              <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
            </div>
            <div className="w-20 h-6 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
