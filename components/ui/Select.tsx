// components/ui/Select.tsx — Select form standar AdminLTE 4

import React, { forwardRef } from "react";
import type { SelectOption } from "../../types/common";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helper?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helper,
      error,
      options,
      placeholder,
      fullWidth = true,
      className = "",
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            className={`block w-full appearance-none px-3.5 py-2.5 pr-10 text-sm rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors focus:outline-none focus:ring-2 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
            } ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <i className="bi bi-chevron-down text-xs" aria-hidden="true" />
          </div>
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

Select.displayName = "Select";
export default Select;
