// components/ui/ErrorState.tsx — Tampilan status error AdminLTE 4

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
      className={`text-center py-10 px-4 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3 text-2xl">
        <i className="bi bi-exclamation-triangle" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-bold text-red-900 dark:text-red-200 mb-1">
        {title}
      </h3>
      <p className="text-xs text-red-700 dark:text-red-300 max-w-md mx-auto mb-4">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          icon="bi-arrow-clockwise"
          onClick={onRetry}
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
