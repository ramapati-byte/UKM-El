// components/ui/Button.tsx — Tombol standar AdminLTE 4

import React from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "outline"
  | "ghost";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: string; // class Bootstrap Icons, e.g. "bi-plus-lg"
  iconPosition?: "left" | "right";
}

const VARIANT_MAP: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs focus:ring-indigo-500/30",
  secondary:
    "bg-slate-600 hover:bg-slate-700 text-white shadow-xs focus:ring-slate-500/30",
  success:
    "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus:ring-emerald-500/30",
  danger:
    "bg-red-600 hover:bg-red-700 text-white shadow-xs focus:ring-red-500/30",
  warning:
    "bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-xs focus:ring-amber-500/30 font-semibold",
  info: "bg-sky-600 hover:bg-sky-700 text-white shadow-xs focus:ring-sky-500/30",
  outline:
    "border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-slate-400/20",
  ghost:
    "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-slate-400/20",
};

const SIZE_MAP: Record<ButtonSize, string> = {
  sm: "text-xs px-2.5 py-1.5 gap-1.5 rounded-md",
  md: "text-sm px-4 py-2 gap-2 rounded-lg",
  lg: "text-base px-5 py-2.5 gap-2.5 rounded-lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  disabled,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed select-none ${VARIANT_MAP[variant]} ${SIZE_MAP[size]} ${className}`}
      {...props}
    >
      {loading && (
        <i
          className="bi bi-arrow-repeat animate-spin text-base"
          aria-hidden="true"
        />
      )}
      {!loading && icon && iconPosition === "left" && (
        <i className={`bi ${icon} text-base`} aria-hidden="true" />
      )}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === "right" && (
        <i className={`bi ${icon} text-base`} aria-hidden="true" />
      )}
    </button>
  );
}
