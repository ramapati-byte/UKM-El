// components/ui/Callout.tsx — Komponen Callout kanonik AdminLTE 4
// Digunakan untuk peringatan bentrok jadwal, info migrasi, atau panduan pengisian

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
  { border: string; bg: string; text: string; defaultIcon: string }
> = {
  info: {
    border: "border-l-4 border-l-sky-500",
    bg: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/50",
    text: "text-sky-900 dark:text-sky-200",
    defaultIcon: "bi-info-circle-fill",
  },
  success: {
    border: "border-l-4 border-l-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50",
    text: "text-emerald-900 dark:text-emerald-200",
    defaultIcon: "bi-check-circle-fill",
  },
  warning: {
    border: "border-l-4 border-l-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50",
    text: "text-amber-900 dark:text-amber-200",
    defaultIcon: "bi-exclamation-triangle-fill",
  },
  danger: {
    border: "border-l-4 border-l-red-500",
    bg: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50",
    text: "text-red-900 dark:text-red-200",
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
      className={`rounded-xl border p-4 text-xs sm:text-sm leading-relaxed ${v.border} ${v.bg} ${v.text} ${className}`}
      role="alert"
      {...props}
    >
      <div className="flex items-start gap-3">
        <i className={`bi ${iconClass} text-base shrink-0 mt-0.5`} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          {title && <h4 className="font-bold mb-1 text-sm">{title}</h4>}
          <div className="space-y-1">{children}</div>
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-md opacity-70 hover:opacity-100 transition shrink-0"
            aria-label="Tutup pesan"
          >
            <i className="bi bi-x-lg text-sm" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
