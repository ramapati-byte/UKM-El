// components/members/MemberHistoryTimeline.tsx — Riwayat keanggotaan lintas UKM

import type { MemberHistoryItem } from "../../types/member";
import MemberStatusBadge from "./MemberStatusBadge";

function formatTanggal(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

interface Props {
  history: MemberHistoryItem[];
}

export default function MemberHistoryTimeline({ history }: Props) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
        Belum ada riwayat keanggotaan di UKM lain.
      </p>
    );
  }

  return (
    <ol className="relative border-l border-slate-200 dark:border-slate-700 pl-6 space-y-6">
      {history.map((item, idx) => (
        <li key={idx} className="relative">
          {/* dot */}
          <span
            className={`absolute -left-[25px] w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
              item.status === "aktif"
                ? "bg-emerald-500"
                : item.status === "alumni"
                ? "bg-sky-500"
                : "bg-slate-400"
            }`}
            aria-hidden="true"
          />

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                {item.ukmNama}
              </p>
              <MemberStatusBadge status={item.status} />
            </div>

            {(item.jabatan || item.divisi) && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">
                {[item.jabatan, item.divisi].filter(Boolean).join(" — ")}
              </p>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400">
              <i className="bi bi-calendar3 mr-1" aria-hidden="true" />
              {formatTanggal(item.periodeGabung)}
              {item.periodeKeluar ? ` – ${formatTanggal(item.periodeKeluar)}` : " – Sekarang"}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
