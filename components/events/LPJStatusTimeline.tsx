// components/events/LPJStatusTimeline.tsx — Timeline alur pengesahan LPJ kegiatan

import React from "react";
import Badge from "../ui/Badge";
import type { EventLPJ } from "../../types/event";
import { formatDateTime } from "../../lib/format";

interface LPJStatusTimelineProps {
  lpj: EventLPJ | null;
  className?: string;
}

export default function LPJStatusTimeline({
  lpj,
  className = "",
}: LPJStatusTimelineProps) {
  const isSubmitted = lpj && lpj.status !== "draft";
  const isApproved = lpj && lpj.status === "approved";
  const isRejected = lpj && lpj.status === "rejected";

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <i className="bi bi-clock-history text-indigo-500" aria-hidden="true" />
          <span>Timeline Pengesahan LPJ</span>
        </h4>
        {lpj ? (
          <Badge
            variant={
              isApproved
                ? "success"
                : isRejected
                ? "danger"
                : isSubmitted
                ? "info"
                : "warning"
            }
            dot
            size="sm"
          >
            {isApproved
              ? "Disahkan"
              : isRejected
              ? "Perlu Revisi"
              : isSubmitted
              ? "Sedang Ditinjau"
              : "Draft LPJ"}
          </Badge>
        ) : (
          <Badge variant="secondary" size="sm" dot>
            Belum Dibuat
          </Badge>
        )}
      </div>

      {/* Vertical Timeline Steps */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {/* Step 1: Draft LPJ */}
        <div className="relative">
          <div
            className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold ring-4 ring-white dark:ring-slate-900 ${
              lpj ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <i className="bi bi-pencil-fill" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Penyusunan Draft LPJ
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {lpj?.created_at
                ? `Disimpan pada ${formatDateTime(lpj.created_at)}`
                : "Belum dimulai oleh pengurus panitia"}
            </p>
          </div>
        </div>

        {/* Step 2: Pengajuan ke Kemahasiswaan */}
        <div className="relative">
          <div
            className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold ring-4 ring-white dark:ring-slate-900 ${
              isSubmitted
                ? "bg-sky-600"
                : "bg-slate-300 dark:bg-slate-700 text-slate-400"
            }`}
          >
            <i className="bi bi-send-fill" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Pengajuan ke Pengawas / Kemahasiswaan
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {lpj?.submitted_at
                ? `Diajukan oleh ${lpj.submitted_by || "Pengurus UKM"} pada ${formatDateTime(
                    lpj.submitted_at
                  )}`
                : "Menunggu pengajuan resmi"}
            </p>
          </div>
        </div>

        {/* Step 3: Verifikasi & Pengesahan */}
        <div className="relative">
          <div
            className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold ring-4 ring-white dark:ring-slate-900 ${
              isApproved
                ? "bg-emerald-600"
                : isRejected
                ? "bg-red-600"
                : "bg-slate-300 dark:bg-slate-700 text-slate-400"
            }`}
          >
            <i
              className={`bi ${
                isApproved
                  ? "bi-check-lg"
                  : isRejected
                  ? "bi-x-lg"
                  : "bi-hourglass-split"
              }`}
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {isApproved
                ? "LPJ Telah Disahkan"
                : isRejected
                ? "LPJ Perlu Revisi / Ditolak"
                : "Verifikasi Berkas & Nota Keuangan"}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {lpj?.reviewed_at
                ? `Ditinjau oleh ${lpj.reviewed_by || "Kemahasiswaan / BEM"} pada ${formatDateTime(
                    lpj.reviewed_at
                  )}`
                : isSubmitted
                ? "Sedang dalam antrean peninjauan kemahasiswaan"
                : "Tahap akhir setelah pengajuan"}
            </p>

            {/* Catatan Reviewer jika ada */}
            {lpj?.notes && (
              <div className="mt-2 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <p className="font-semibold text-slate-700 dark:text-slate-200">
                  Catatan Kemahasiswaan:
                </p>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5 italic">
                  &ldquo;{lpj.notes}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
