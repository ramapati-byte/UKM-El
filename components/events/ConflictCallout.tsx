// components/events/ConflictCallout.tsx — Peringatan bentrok jadwal & ruangan (non-blocking)

"use client";

import React, { useState } from "react";
import Callout from "../ui/Callout";
import type { ConflictCheckResult } from "../../types/event";
import { formatDateTime } from "../../lib/format";

interface ConflictCalloutProps {
  result: ConflictCheckResult;
  onAcknowledge?: (acknowledged: boolean, reason?: string) => void;
  className?: string;
}

export default function ConflictCallout({
  result,
  onAcknowledge,
  className = "",
}: ConflictCalloutProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [reason, setReason] = useState("");

  if (!result.has_conflict || result.conflicts.length === 0) {
    return null;
  }

  const handleCheckboxChange = (checked: boolean) => {
    setAcknowledged(checked);
    onAcknowledge?.(checked, reason);
  };

  const handleReasonChange = (val: string) => {
    setReason(val);
    onAcknowledge?.(acknowledged, val);
  };

  return (
    <Callout
      variant="warning"
      title={`Terdeteksi ${result.conflicts.length} Potensi Bentrok Jadwal / Ruangan`}
      icon="bi-exclamation-triangle-fill"
      className={className}
    >
      <div className="space-y-3 mt-2">
        <p className="text-xs text-amber-900 dark:text-amber-200">
          Sistem mendeteksi jadwal atau ruangan yang Anda pilih beririsan dengan kegiatan lain yang telah terdaftar di kalender:
        </p>

        {/* Daftar Bentrok */}
        <div className="space-y-2">
          {result.conflicts.map((c, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-amber-100/70 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-xs space-y-1"
            >
              <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                <i
                  className={`bi ${
                    c.type === "room" ? "bi-building-exclamation" : "bi-calendar-range"
                  }`}
                  aria-hidden="true"
                />
                <span>
                  {c.type === "room" ? "Bentrok Ruangan" : "Bentrok Jadwal UKM"}
                </span>
                <span className="text-[11px] font-normal text-amber-700 dark:text-amber-300">
                  • {c.event_title}
                </span>
              </div>
              <p className="text-amber-800 dark:text-amber-300 pl-5">
                {c.message}
              </p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 pl-5">
                Waktu kegiatan terkait: {formatDateTime(c.starts_at)}
                {c.ends_at && ` s/d ${formatDateTime(c.ends_at)}`}
              </p>
            </div>
          ))}
        </div>

        {/* Opsi Tetap Simpan (Peringatan Saja - Sesuai Keputusan Desain) */}
        <div className="pt-2 border-t border-amber-200 dark:border-amber-900/60 space-y-2">
          <label className="flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => handleCheckboxChange(e.target.checked)}
              className="mt-0.5 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-xs font-semibold text-amber-900 dark:text-amber-100">
              Saya memahami adanya peringatan bentrok di atas dan ingin tetap melanjutkan penyimpanan (Peringatan Saja).
            </span>
          </label>

          {acknowledged && (
            <div className="pl-6 animate-in fade-in duration-200">
              <input
                type="text"
                placeholder="Catatan / alasan tetap melanjutkan (opsional, misal: bergantian sesi)..."
                value={reason}
                onChange={(e) => handleReasonChange(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          )}
        </div>
      </div>
    </Callout>
  );
}
