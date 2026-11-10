// components/ui/Badge.tsx — Badge status kanonik AdminLTE 4

import React from "react";
import type { BadgeVariant } from "../../types/common";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  pill?: boolean;
  size?: "sm" | "md";
  dot?: boolean;
}

const VARIANT_MAP: Record<BadgeVariant, string> = {
  primary:
    "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60",
  success:
    "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60",
  info: "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/60",
  warning:
    "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60",
  danger:
    "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200/60 dark:border-red-800/60",
  secondary:
    "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
};

const DOT_MAP: Record<BadgeVariant, string> = {
  primary: "bg-indigo-600",
  success: "bg-emerald-600",
  info: "bg-sky-600",
  warning: "bg-amber-500",
  danger: "bg-red-600",
  secondary: "bg-slate-500",
};

export default function Badge({
  children,
  variant = "secondary",
  pill = true,
  size = "md",
  dot = false,
  className = "",
  ...props
}: BadgeProps) {
  const sizeClass = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";
  const radiusClass = pill ? "rounded-full" : "rounded-md";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold border ${VARIANT_MAP[variant]} ${sizeClass} ${radiusClass} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT_MAP[variant]}`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
}
