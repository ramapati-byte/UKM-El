// components/ui/StatCard.tsx — Widget SmallBox / StatCard AdminLTE 4

import React from "react";
import type { BadgeVariant } from "../../types/common";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: string; // class Bootstrap Icons, e.g. "bi-calendar-event"
  variant?: BadgeVariant;
  subtitle?: string;
  trend?: {
    value: string;
    isUp?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

const VARIANT_ACCENT: Record<BadgeVariant, { bg: string; text: string; iconBg: string }> = {
  primary: {
    bg: "border-l-4 border-l-indigo-600",
    text: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400",
  },
  success: {
    bg: "border-l-4 border-l-emerald-600",
    text: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
  },
  info: {
    bg: "border-l-4 border-l-sky-600",
    text: "text-sky-600 dark:text-sky-400",
    iconBg: "bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400",
  },
  warning: {
    bg: "border-l-4 border-l-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400",
  },
  danger: {
    bg: "border-l-4 border-l-red-600",
    text: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400",
  },
  secondary: {
    bg: "border-l-4 border-l-slate-500",
    text: "text-slate-600 dark:text-slate-400",
    iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  },
};

export default function StatCard({
  title,
  value,
  icon,
  variant = "primary",
  subtitle,
  trend,
  onClick,
  className = "",
}: StatCardProps) {
  const accent = VARIANT_ACCENT[variant];

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex items-center justify-between gap-4 transition-all hover:shadow-md ${
        accent.bg
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
          {title}
        </p>
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 leading-tight">
          {value}
        </p>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1.5 text-xs">
            {trend && (
              <span
                className={`font-semibold inline-flex items-center gap-0.5 ${
                  trend.isUp ? "text-emerald-600" : "text-red-600"
                }`}
              >
                <i
                  className={`bi ${trend.isUp ? "bi-arrow-up-short" : "bi-arrow-down-short"}`}
                  aria-hidden="true"
                />
                {trend.value}
              </span>
            )}
            {subtitle && (
              <span className="text-slate-500 dark:text-slate-400 truncate">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>

      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl ${accent.iconBg}`}
      >
        <i className={`bi ${icon}`} aria-hidden="true" />
      </div>
    </div>
  );
}
