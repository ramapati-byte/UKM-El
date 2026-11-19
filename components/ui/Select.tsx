// components/ui/Select.tsx — Modern Clean Select Field

import React, { forwardRef } from "react";
import type { SelectOption } from "../../types/common";

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  helper?: string;
  error?: string;
  /** Daftar opsi. Jika disediakan, children diabaikan. */
  options?: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  /**
   * Handler perubahan nilai.
   * - Jika fungsi dengan 1 argumen string: dipanggil dengan value langsung.
   * - Jika fungsi dengan ChangeEvent: dipanggil seperti onChange HTML biasa.
   */
  onChange?: ((value: string) => void) | React.ChangeEventHandler<HTMLSelectElement>;
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
      children,
      onChange,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
      if (!onChange) return;
      if (onChange.length <= 1) {
        (onChange as (value: string) => void)(e.target.value);
      } else {
        (onChange as React.ChangeEventHandler<HTMLSelectElement>)(e);
      }
    };

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
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
            onChange={handleChange}
            className={`block w-full appearance-none px-4 py-2.5 pr-10 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-all focus:outline-none focus:ring-2 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed shadow-2xs ${
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
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <i className="bi bi-chevron-down text-xs" aria-hidden="true" />
          </div>
        </div>

        {error && (
          <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <i className="bi bi-exclamation-circle" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}

        {!error && helper && (
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {helper}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
