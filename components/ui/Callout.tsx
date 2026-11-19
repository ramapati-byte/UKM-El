// components/ui/Callout.tsx — Modern Contextual Callout Banner

import React from "react";

export type CalloutVariant = "info" | "success" | "warning" | "danger";

export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CalloutVariant;
  title?: string;
  icon?: string; // class Bootstrap Icons
  dismissible?: boolean;
  onDismiss?: () => void;
}

const VARIANT_MAP: Record<
  CalloutVariant,
  { bg: string; border: string; text: string; iconColor: string; defaultIcon: string }
> = {
  info: {
    bg: "bg-sky-50/80 dark:bg-sky-950/30",
    border: "border-sky-200 dark:border-sky-800/60",
    text: "text-sky-900 dark:text-sky-200",
    iconColor: "text-sky-600 dark:text-sky-400",
    defaultIcon: "bi-info-circle-fill",
  },
  success: {
    bg: "bg-emerald-50/80 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800/60",
    text: "text-emerald-900 dark:text-emerald-200",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    defaultIcon: "bi-check-circle-fill",
  },
  warning: {
    bg: "bg-amber-50/80 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800/60",
    text: "text-amber-900 dark:text-amber-200",
    iconColor: "text-amber-600 dark:text-amber-400",
    defaultIcon: "bi-exclamation-triangle-fill",
  },
  danger: {
    bg: "bg-red-50/80 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800/60",
    text: "text-red-900 dark:text-red-200",
    iconColor: "text-red-600 dark:text-red-400",
    defaultIcon: "bi-x-octagon-fill",
  },
};

export default function Callout({
  children,
  variant = "info",
  title,
  icon,
  dismissible = false,
  onDismiss,
  className = "",
  ...props
}: CalloutProps) {
  const v = VARIANT_MAP[variant];
  const iconClass = icon || v.defaultIcon;

  return (
    <div
      className={`rounded-2xl border p-4.5 text-xs sm:text-sm leading-relaxed ${v.border} ${v.bg} ${v.text} shadow-2xs ${className}`}
      role="alert"
      {...props}
    >
      <div className="flex items-start gap-3">
        <i className={`bi ${iconClass} ${v.iconColor} text-lg shrink-0 mt-0.5`} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          {title && <h4 className="font-bold mb-1 text-sm tracking-tight">{title}</h4>}
          <div className="space-y-1 font-medium">{children}</div>
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition shrink-0"
            aria-label="Tutup pesan"
          >
            <i className="bi bi-x-lg text-xs" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
