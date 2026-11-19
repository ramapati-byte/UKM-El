// components/ui/ErrorState.tsx — Modern Clean Error State

import React from "react";
import Button from "./Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  title = "Terjadi Kesalahan",
  message = "Gagal memuat data dari server. Silakan coba beberapa saat lagi.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`text-center py-12 px-6 bg-red-50/40 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 rounded-2xl ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 flex items-center justify-center mx-auto mb-3.5 text-2xl shadow-xs">
        <i className="bi bi-exclamation-triangle" aria-hidden="true" />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-red-950 dark:text-red-200 mb-1.5 tracking-tight">
        {title}
      </h3>
      <p className="text-xs text-red-700 dark:text-red-300 max-w-md mx-auto mb-4.5 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          icon="bi-arrow-clockwise"
          onClick={onRetry}
          className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
        >
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
