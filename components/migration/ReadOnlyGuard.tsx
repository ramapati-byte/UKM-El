// components/migration/ReadOnlyGuard.tsx — Wrapper guard read-only

"use client";

import { isMockEnabled } from "../../lib/env";

interface ReadOnlyGuardProps {
  children: React.ReactNode;
  action: string;
  readOnly?: boolean;
}

export default function ReadOnlyGuard({ children, action, readOnly = false }: ReadOnlyGuardProps) {
  const isLegacy = process.env.NEXT_PUBLIC_ENABLE_LEGACY_MODE === "true";

  if (isLegacy || readOnly) {
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/20 rounded">
          <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs px-2 py-1 rounded">
            <i className="bi bi-lock-fill mr-1"></i>
            Mode Read-Only
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}