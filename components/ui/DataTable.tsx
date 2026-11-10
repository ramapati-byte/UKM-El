// components/ui/DataTable.tsx — Tabel data AdminLTE 4 responsif
// Otomatis berubah menjadi card list di mobile

"use client";

import React from "react";
import LoadingSkeleton from "./LoadingSkeleton";
import EmptyState from "./EmptyState";

export interface Column<T> {
  key: string;
  /** Label kolom — alias `header` untuk kompatibilitas */
  header?: string;
  /** Alias untuk `header` */
  label?: string;
  align?: "left" | "center" | "right";
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface RowAction<T> {
  label: string | ((row: T) => string);
  onClick: (row: T) => void;
  variant?: "default" | "danger" | "warning" | "success";
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  /** Jika tidak disuplai, menggunakan field `id` pada row */
  keyExtractor?: (row: T) => string | number;
  loading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  renderMobileCard?: (row: T, index: number) => React.ReactNode;
  className?: string;
  /** Tombol aksi per baris — opsional */
  rowActions?: RowAction<T>[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyTitle = "Tidak ada data",
  emptyMessage = "Belum ada data untuk ditampilkan saat ini.",
  emptyAction,
  renderMobileCard,
  className = "",
  rowActions = [],
}: DataTableProps<T>) {
  if (loading) {
    return <LoadingSkeleton variant="table" rows={5} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        action={emptyAction}
      />
    );
  }

  const getKey = (row: T): string | number => {
    if (keyExtractor) return keyExtractor(row);
    if ("id" in row) return row["id"] as string | number;
    return Math.random();
  };

  const getColLabel = (col: Column<T>) => col.header ?? col.label ?? col.key;

  const getAlignClass = (align?: Column<T>["align"]) => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  const getActionVariantClass = (variant?: RowAction<T>["variant"]) => {
    switch (variant) {
      case "danger":  return "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300";
      case "warning": return "text-amber-600 hover:text-amber-700 dark:text-amber-400";
      case "success": return "text-emerald-600 hover:text-emerald-700 dark:text-emerald-400";
      default:        return "text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300";
    }
  };

  const resolveLabel = (action: RowAction<T>, row: T) =>
    typeof action.label === "function" ? action.label(row) : action.label;

  const hasActions = rowActions.length > 0;
  const allColumns = hasActions
    ? [...columns, { key: "__actions__", header: "Aksi", align: "right" as const }]
    : columns;

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      {/* ─── Desktop Table View (>= md) ────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
              {allColumns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${getAlignClass(
                    col.align
                  )}`}
                >
                  {getColLabel(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {data.map((row, idx) => (
              <tr
                key={getKey(row)}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3.5 text-slate-700 dark:text-slate-200 align-middle ${getAlignClass(
                      col.align
                    )}`}
                  >
                    {col.render
                      ? col.render(row, idx)
                      : (row[col.key] as React.ReactNode) ?? "-"}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-4 py-3.5 text-right align-middle">
                    <div className="flex items-center justify-end gap-3">
                      {rowActions.map((action, aIdx) => {
                        const lbl = resolveLabel(action, row);
                        if (!lbl || lbl === "-") return null;
                        return (
                          <button
                            key={aIdx}
                            onClick={() => action.onClick(row)}
                            className={`text-xs font-medium transition-colors ${getActionVariantClass(action.variant)}`}
                          >
                            {lbl}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Mobile Card View (< md) ────────────────────── */}
      <div className="md:hidden space-y-3 p-3">
        {data.map((row, idx) => {
          if (renderMobileCard) {
            return (
              <div key={getKey(row)}>{renderMobileCard(row, idx)}</div>
            );
          }

          // Fallback auto card
          return (
            <div
              key={getKey(row)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-2"
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="flex items-center justify-between text-xs gap-2"
                >
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    {getColLabel(col)}
                  </span>
                  <div className="text-slate-800 dark:text-slate-100 text-right">
                    {col.render
                      ? col.render(row, idx)
                      : (row[col.key] as React.ReactNode) ?? "-"}
                  </div>
                </div>
              ))}
              {hasActions && (
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {rowActions.map((action, aIdx) => {
                    const lbl = resolveLabel(action, row);
                    if (!lbl || lbl === "-") return null;
                    return (
                      <button
                        key={aIdx}
                        onClick={() => action.onClick(row)}
                        className={`text-xs font-medium transition-colors ${getActionVariantClass(action.variant)}`}
                      >
                        {lbl}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
