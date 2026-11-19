// components/migration/LegacyBanner.tsx — Banner legacy global

"use client";

import { useState } from "react";
import { isLegacyModeEnabled } from "../../lib/env";

export default function LegacyBanner() {
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("legacy_banner_dismissed") === "true";
    }
    return false;
  });

  const handleDismiss = () => {
    localStorage.setItem("legacy_banner_dismissed", "true");
    setDismissed(true);
    setVisible(false);
  };

  if (!isLegacyModeEnabled() || dismissed || !visible) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <span>Sistem lama (legacy) berjalan dalam mode read-only. Data lama tetap dapat dibaca.</span>
      </div>
      <button onClick={handleDismiss} className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200">
        <i className="bi bi-x-lg"></i>
      </button>
    </div>
  );
}