// components/ui/Button.tsx — Modern Interactive Action Button

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
    "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-xs shadow-indigo-600/20 focus:ring-indigo-500/30",
  secondary:
    "bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white shadow-xs focus:ring-slate-500/30",
  success:
    "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-xs shadow-emerald-600/20 focus:ring-emerald-500/30",
  danger:
    "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-xs shadow-red-600/20 focus:ring-red-500/30",
  warning:
    "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold shadow-xs shadow-amber-500/20 focus:ring-amber-500/30",
  info: "bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white shadow-xs shadow-sky-600/20 focus:ring-sky-500/30",
  outline:
    "border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-slate-400/20 shadow-2xs",
  ghost:
    "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-slate-400/20",
};

const SIZE_MAP: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5 gap-2 rounded-xl",
  lg: "text-base px-6 py-3 gap-2.5 rounded-xl",
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
      className={`inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.98] ${VARIANT_MAP[variant]} ${SIZE_MAP[size]} ${className}`}
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
