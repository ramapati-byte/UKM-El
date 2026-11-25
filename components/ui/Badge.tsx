// components/ui/Badge.tsx — Modern Refined Status Badge with Sunrise Glow

import React from "react";
import type { BadgeVariant } from "../../types/common";

export type ExtendedBadgeVariant = BadgeVariant | "sunrise";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: ExtendedBadgeVariant;
  pill?: boolean;
  size?: "sm" | "md";
  dot?: boolean;
  pulse?: boolean;
}

const VARIANT_MAP: Record<ExtendedBadgeVariant, string> = {
  primary:
    "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60",
  sunrise:
    "bg-gradient-to-r from-amber-50 to-rose-50 text-rose-700 border-rose-200/80 dark:from-rose-950/40 dark:to-amber-950/40 dark:text-rose-300 dark:border-rose-800/60 font-bold",
  success:
    "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60",
  info: "bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/60",
  warning:
    "bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60",
  danger:
    "bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60",
  secondary:
    "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
};

const DOT_MAP: Record<ExtendedBadgeVariant, string> = {
  primary: "bg-indigo-600",
  sunrise: "bg-rose-500",
  success: "bg-emerald-600",
  info: "bg-sky-600",
  warning: "bg-amber-500",
  danger: "bg-rose-600",
  secondary: "bg-slate-500",
};

export default function Badge({
  children,
  variant = "secondary",
  pill = true,
  size = "md",
  dot = false,
  pulse = false,
  className = "",
  ...props
}: BadgeProps) {
  const sizeClass = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";
  const radiusClass = pill ? "rounded-full" : "rounded-lg";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold border tracking-tight shadow-2xs ${VARIANT_MAP[variant]} ${sizeClass} ${radiusClass} ${className}`}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2 shrink-0">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${DOT_MAP[variant]}`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${DOT_MAP[variant]}`}
          />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}
