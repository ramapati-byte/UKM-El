// components/ui/Input.tsx — Input form standar AdminLTE 4

import React, { forwardRef } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
  icon?: string; // class Bootstrap Icons, e.g. "bi-search"
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helper,
      error,
      icon,
      fullWidth = true,
      className = "",
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <i className={`bi ${icon} text-base`} aria-hidden="true" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            className={`block w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed ${
              icon ? "pl-10" : ""
            } ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
            } ${className}`}
            {...props}
          />
        </div>

        {error && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            <i className="bi bi-exclamation-circle" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}

        {!error && helper && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
