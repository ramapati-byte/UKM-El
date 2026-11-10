// components/members/RecruitmentPipeline.tsx — Kanban pipeline seleksi 4 tahap

"use client";

import { useState } from "react";
import type { Applicant, RecruitmentStage, ApplicantStatus } from "../../types/member";
import { ApplicantStatusBadge } from "./RecruitmentStatusBadge";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

const STAGES: { key: RecruitmentStage; label: string; icon: string; color: string }[] = [
  { key: "pendaftaran", label: "Pendaftaran",  icon: "bi-pencil-square",  color: "border-t-indigo-500" },
  { key: "verifikasi",  label: "Verifikasi",   icon: "bi-search",         color: "border-t-amber-500"  },
  { key: "seleksi",     label: "Seleksi",      icon: "bi-funnel",         color: "border-t-sky-500"    },
  { key: "pengumuman",  label: "Pengumuman",   icon: "bi-megaphone",      color: "border-t-emerald-500"},
];

interface Props {
  applicants: Applicant[];
  onMove: (applicantId: string, stage: RecruitmentStage, status: ApplicantStatus, catatan?: string) => Promise<void>;
}

interface DetailState {
  open: boolean;
  applicant: Applicant | null;
  nextStage: RecruitmentStage | null;
}

export default function RecruitmentPipeline({ applicants, onMove }: Props) {
  const [detail, setDetail] = useState<DetailState>({
    open: false,
    applicant: null,
    nextStage: null,
  });
  const [catatan, setCatatan] = useState("");
  const [moving, setMoving] = useState(false);

  const byStage = (stage: RecruitmentStage) =>
    applicants.filter((a) => a.stage === stage);

  const stageIndex = (s: RecruitmentStage) => STAGES.findIndex((x) => x.key === s);

  const handleCardClick = (applicant: Applicant) => {
    setDetail({ open: true, applicant, nextStage: null });
    setCatatan("");
  };

  const handleLuluskan = (applicant: Applicant) => {
    const currentIdx = stageIndex(applicant.stage);
    const nextStage = STAGES[currentIdx + 1]?.key ?? null;
    setDetail({ open: true, applicant, nextStage });
    setCatatan("");
  };

  const handleGugurkan = async (applicant: Applicant) => {
    if (!confirm(`Gugurkan ${applicant.namaLengkap}?`)) return;
    await onMove(applicant.id, applicant.stage, "gugur", catatan);
  };

  const confirmMove = async () => {
    if (!detail.applicant || !detail.nextStage) return;
    setMoving(true);
    try {
      await onMove(detail.applicant.id, detail.nextStage, "lolos", catatan);
      setDetail({ open: false, applicant: null, nextStage: null });
    } finally {
      setMoving(false);
    }
  };

  return (
    <>
      {/* Pipeline board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAGES.map((stage) => {
          const cards = byStage(stage.key);
          return (
            <div
              key={stage.key}
              className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs border-t-4 ${stage.color}`}
            >
              {/* Kolom header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <i className={`bi ${stage.icon}`} aria-hidden="true" />
                  {stage.label}
                </div>
                <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full px-2 py-0.5">
                  {cards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="p-3 space-y-2 min-h-[120px]">
                {cards.length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">
                    Tidak ada pendaftar
                  </p>
                )}
                {cards.map((applicant) => (
                  <ApplicantCard
                    key={applicant.id}
                    applicant={applicant}
                    isLastStage={stageIndex(applicant.stage) === STAGES.length - 1}
                    onClick={() => handleCardClick(applicant)}
                    onLuluskan={() => handleLuluskan(applicant)}
                    onGugurkan={() => handleGugurkan(applicant)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal detail / konfirmasi pindah tahap */}
      <Modal
        open={detail.open}
        onClose={() => setDetail({ open: false, applicant: null, nextStage: null })}
        title={detail.nextStage ? "Luluskan ke Tahap Berikutnya" : "Detail Pendaftar"}
        size="lg"
        footer={
          detail.nextStage ? (
            <>
              <Button
                variant="outline"
                onClick={() => setDetail({ open: false, applicant: null, nextStage: null })}
              >
                Batal
              </Button>
              <Button variant="success" loading={moving} onClick={confirmMove}>
                Luluskan ke {STAGES.find((s) => s.key === detail.nextStage)?.label}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => setDetail({ open: false, applicant: null, nextStage: null })}
            >
              Tutup
            </Button>
          )
        }
      >
        {detail.applicant && (
          <div className="space-y-4">
            {/* Info utama */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg shrink-0">
                {detail.applicant.namaLengkap.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {detail.applicant.namaLengkap}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {detail.applicant.nim && <span className="mr-2">NIM: {detail.applicant.nim}</span>}
                  {detail.applicant.email}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <ApplicantStatusBadge status={detail.applicant.status} />
                  <span className="text-xs text-slate-400">
                    Tahap: {STAGES.find((s) => s.key === detail.applicant!.stage)?.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Jawaban form */}
            {detail.applicant.formAnswers.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Jawaban Formulir
                </p>
                {detail.applicant.formAnswers.map((ans) => (
                  <div key={ans.fieldId}>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                      {ans.fieldLabel}
                    </p>
                    <p className="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-line">
                      {ans.value || <span className="italic text-slate-400">—</span>}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Catatan admin saat luluskan */}
            {detail.nextStage && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Catatan Admin <span className="text-slate-400 font-normal">(opsional)</span>
                </label>
                <textarea
                  rows={2}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Catatan untuk rekrutmen ini..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
                />
              </div>
            )}

            {/* Catatan lama */}
            {!detail.nextStage && detail.applicant.catatanAdmin && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-300">
                <i className="bi bi-info-circle mr-1.5" />
                {detail.applicant.catatanAdmin}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

// ─── Kartu pendaftar ─────────────────────────────────────

interface ApplicantCardProps {
  applicant: Applicant;
  isLastStage: boolean;
  onClick: () => void;
  onLuluskan: () => void;
  onGugurkan: () => void;
}

function ApplicantCard({
  applicant,
  isLastStage,
  onClick,
  onLuluskan,
  onGugurkan,
}: ApplicantCardProps) {
  const isGugur = applicant.status === "gugur";
  const isLolosLast = applicant.status === "lolos" && isLastStage;

  return (
    <div
      className={`rounded-lg border p-3 cursor-pointer transition-all group ${
        isGugur
          ? "border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/10 opacity-60"
          : isLolosLast
          ? "border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/10"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
          {applicant.namaLengkap}
        </p>
        <ApplicantStatusBadge status={applicant.status} />
      </div>

      {applicant.nim && (
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1.5">
          {applicant.nim}
        </p>
      )}

      <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-2">
        <i className="bi bi-clock mr-1" aria-hidden="true" />
        {new Date(applicant.submittedAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        })}
      </p>

      {/* Aksi — hanya tampil saat hover & status masih pending */}
      {applicant.status === "pending" && !isLastStage && (
        <div
          className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onLuluskan}
            className="flex-1 text-[10px] py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 font-semibold transition"
          >
            <i className="bi bi-arrow-right-circle mr-0.5" />
            Luluskan
          </button>
          <button
            type="button"
            onClick={onGugurkan}
            className="flex-1 text-[10px] py-1 rounded bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-semibold transition"
          >
            <i className="bi bi-x-circle mr-0.5" />
            Gugur
          </button>
        </div>
      )}

      {applicant.status === "pending" && isLastStage && (
        <div
          className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onLuluskan}
            className="flex-1 text-[10px] py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 font-semibold transition"
          >
            <i className="bi bi-check-circle mr-0.5" />
            Terima
          </button>
          <button
            type="button"
            onClick={onGugurkan}
            className="flex-1 text-[10px] py-1 rounded bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-semibold transition"
          >
            <i className="bi bi-x-circle mr-0.5" />
            Tolak
          </button>
        </div>
      )}
    </div>
  );
}
