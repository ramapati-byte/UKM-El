// components/ui/Pagination.tsx — Komponen navigasi halaman AdminLTE 4

import React from "react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Tampilkan maksimal 5 nomor halaman
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 ${className}`}
    >
      <div>
        {totalRecords !== undefined ? (
          <span>
            Menampilkan halaman <b>{currentPage}</b> dari <b>{totalPages}</b> (Total {totalRecords} data)
          </span>
        ) : (
          <span>
            Halaman <b>{currentPage}</b> dari <b>{totalPages}</b>
          </span>
        )}
      </div>

      <nav aria-label="Navigasi halaman" className="flex items-center gap-1">
        {/* Tombol Pertama */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
          aria-label="Halaman pertama"
        >
          <i className="bi bi-chevron-double-left" aria-hidden="true" />
        </button>

        {/* Tombol Sebelumnya */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
          aria-label="Halaman sebelumnya"
        >
          <i className="bi bi-chevron-left" aria-hidden="true" />
        </button>

        {/* Nomor Halaman */}
        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`min-w-[32px] h-8 px-2 rounded-lg font-semibold transition ${
                isActive
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Tombol Berikutnya */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
          aria-label="Halaman berikutnya"
        >
          <i className="bi bi-chevron-right" aria-hidden="true" />
        </button>

        {/* Tombol Terakhir */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
          aria-label="Halaman terakhir"
        >
          <i className="bi bi-chevron-double-right" aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}
