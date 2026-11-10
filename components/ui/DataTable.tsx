// components/ui/DataTable.tsx — Tabel data AdminLTE 4 responsif
// Otomatis berubah menjadi card list di mobile

"use client";

import React from "react";
import LoadingSkeleton from "./LoadingSkeleton";
import EmptyState from "./EmptyState";

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  loading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  renderMobileCard?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyTitle = "Tidak ada data",
  emptyMessage = "Belum ada data untuk ditampilkan saat ini.",
  emptyAction,
  renderMobileCard,
  className = "",
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

  const getAlignClass = (align?: Column<T>["align"]) => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      {/* ─── Desktop Table View (>= md) ────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${getAlignClass(
                    col.align
                  )}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {data.map((row, idx) => (
              <tr
                key={keyExtractor(row)}
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
                      : ((row as Record<string, unknown>)[col.key] as React.ReactNode) ?? "-"}
                  </td>
                ))}
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
              <div key={keyExtractor(row)}>{renderMobileCard(row, idx)}</div>
            );
          }

          // Fallback auto card jika tidak disediakan renderMobileCard kustom
          return (
            <div
              key={keyExtractor(row)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-2"
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="flex items-center justify-between text-xs gap-2"
                >
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    {col.header}
                  </span>
                  <div className="text-slate-800 dark:text-slate-100 text-right">
                    {col.render
                      ? col.render(row, idx)
                      : ((row as Record<string, unknown>)[col.key] as React.ReactNode) ?? "-"}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
