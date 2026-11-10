// components/ui/Select.tsx — Select form standar AdminLTE 4
// Mendukung dua pola:
//   1. Declarative: options={[{value, label}]} (asli)
//   2. Children: <Select><option>...</option></Select> (baru)
// onChange dapat menerima event React standar ATAU callback (value: string) => void

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
      // Deteksi apakah handler mengharapkan string atau event
      // Fungsi dengan 1 parameter → callback(value)
      // Fungsi dengan ChangeEvent → handler(e)
      if (onChange.length <= 1) {
        // Bisa jadi keduanya — coba panggil dengan value
        // Heuristik: jika bukan event handler (tidak ada nativeEvent), pakai string
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
            onChange={handleChange}
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
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
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
