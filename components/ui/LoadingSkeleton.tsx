// components/ui/LoadingSkeleton.tsx — Modern Skeleton Loader

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
      <div className={`space-y-2.5 animate-pulse ${className}`}>
        <div className="h-4 bg-slate-200/80 dark:bg-slate-800 rounded-lg w-3/4" />
        <div className="h-4 bg-slate-200/80 dark:bg-slate-800 rounded-lg w-1/2" />
        <div className="h-4 bg-slate-200/80 dark:bg-slate-800 rounded-lg w-5/6" />
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse ${className}`}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-3.5 shadow-xs"
          >
            <div className="h-36 bg-slate-200/70 dark:bg-slate-800 rounded-xl w-full" />
            <div className="h-4 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-3/4" />
            <div className="h-3 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-1/2" />
            <div className="h-3 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "calendar") {
    return (
      <div
        className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 animate-pulse shadow-xs ${className}`}
      >
        <div className="h-8 bg-slate-200/70 dark:bg-slate-800 rounded-xl w-1/4 mb-4" />
        <div className="grid grid-cols-7 gap-2.5">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  // Default: table
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden animate-pulse shadow-xs ${className}`}
    >
      <div className="h-12 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800" />
      <div className="p-5 space-y-3.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-200/70 dark:bg-slate-800 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-2/5" />
              <div className="h-2.5 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-1/4" />
            </div>
            <div className="w-20 h-7 bg-slate-200/70 dark:bg-slate-800 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
