// components/ui/StatCard.tsx — Modern KPI / Metric Widget

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

const VARIANT_ACCENT: Record<
  BadgeVariant,
  { iconBg: string; text: string; glow: string }
> = {
  primary: {
    iconBg: "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60",
    text: "text-indigo-600 dark:text-indigo-400",
    glow: "group-hover:border-indigo-300 dark:group-hover:border-indigo-600",
  },
  success: {
    iconBg: "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60",
    text: "text-emerald-600 dark:text-emerald-400",
    glow: "group-hover:border-emerald-300 dark:group-hover:border-emerald-600",
  },
  info: {
    iconBg: "bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/60",
    text: "text-sky-600 dark:text-sky-400",
    glow: "group-hover:border-sky-300 dark:group-hover:border-sky-600",
  },
  warning: {
    iconBg: "bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/60",
    text: "text-amber-600 dark:text-amber-400",
    glow: "group-hover:border-amber-300 dark:group-hover:border-amber-600",
  },
  danger: {
    iconBg: "bg-red-50 dark:bg-red-950/70 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/60",
    text: "text-red-600 dark:text-red-400",
    glow: "group-hover:border-red-300 dark:group-hover:border-red-600",
  },
  secondary: {
    iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
    text: "text-slate-600 dark:text-slate-400",
    glow: "group-hover:border-slate-300 dark:group-hover:border-slate-600",
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
      className={`group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between ${
        accent.glow
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 tracking-tight leading-none">
            {value}
          </p>
        </div>

        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl shadow-xs transition-transform duration-200 group-hover:scale-105 ${accent.iconBg}`}
        >
          <i className={`bi ${icon}`} aria-hidden="true" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          {trend && (
            <span
              className={`font-semibold inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                trend.isUp
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                  : "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400"
              }`}
            >
              <i
                className={`bi ${trend.isUp ? "bi-arrow-up-short" : "bi-arrow-down-short"} text-sm`}
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
  );
}
