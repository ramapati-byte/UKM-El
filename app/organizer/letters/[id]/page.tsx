"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import AppShell from "@/components/shell/AppShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { letterService } from "@/services/letter.service";
import type { LetterEntity, LetterStatus } from "@/types/letter";
import type { BadgeVariant } from "@/types/common";
import { formatDateLong, formatDateShort } from "@/lib/format";

const statusVariantMap: Record<string, BadgeVariant> = {
  draft: "secondary",
  diajukan: "info",
  disetujui: "success",
  ditolak: "danger",
  diarsip: "secondary",
};

const statusLabelMap: Record<string, string> = {
  draft: "Draft",
  diajukan: "Diajukan",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
  diarsip: "Diarsip",
};

const priorityVariantMap: Record<string, BadgeVariant> = {
  rendah: "secondary",
  normal: "info",
  tinggi: "warning",
  urgent: "danger",
};

export default function LetterDetailPage({
  params: paramsProp,
}: {
  params: Promise<{ id: string }>;
}) {
  const params =
    "then" in paramsProp
      ? use(paramsProp as Promise<{ id: string }>)
      : (paramsProp as { id: string });
  const [letter, setLetter] = useState<LetterEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await letterService.detail(params.id);
      setLetter(data);
      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Surat tidak ditemukan";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdateStatus = async (newStatus: LetterStatus, catatan?: string) => {
    if (!letter) return;
    const confirmText =
      newStatus === "disetujui"
        ? "Setujui surat ini?"
        : newStatus === "ditolak"
        ? "Tolak surat ini?"
        : newStatus === "diajukan"
        ? "Ajukan surat ini untuk approval?"
        : "Arsipkan surat ini?";
    if (!confirm(confirmText)) return;

    setActionLoading(true);
    try {
      const updated = await letterService.updateStatus(letter.id, {
        status: newStatus,
        catatan,
      });
      setLetter(updated);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memperbarui status";
      alert(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <AppShell title="Detail Surat">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-2">
            <i className="bi bi-arrow-repeat text-2xl animate-spin text-indigo-600 inline-block" />
            <p className="text-sm text-slate-500">Memuat detail surat...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !letter) {
    return (
      <AppShell title="Detail Surat">
        <div className="p-8 text-center max-w-lg mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <i className="bi bi-file-earmark-x text-4xl text-danger mb-3 block" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Gagal Memuat Surat
          </h2>
          <p className="text-sm text-slate-500 mb-4">{error || "Data tidak ditemukan."}</p>
          <Link href="/organizer/letters">
            <Button variant="outline">Kembali ke Daftar Surat</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Detail Surat"
      subtitle={letter.nomorSurat}
      breadcrumbs={[
        { label: "Dashboard", href: "/organizer/dashboard" },
        { label: "Surat Menyurat", href: "/organizer/letters" },
        { label: letter.nomorSurat },
      ]}
      actions={
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" onClick={handlePrint}>
            <i className="bi bi-printer mr-1.5" aria-hidden="true" /> Cetak
          </Button>
          <Link href="/organizer/letters">
            <Button variant="outline">
              <i className="bi bi-arrow-left mr-1.5" aria-hidden="true" /> Kembali
            </Button>
          </Link>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Konten Utama / Preview Surat */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card Lembar Surat (Printable) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 sm:p-12 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
            {/* Kop Surat Sederhana */}
            <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-4 text-center space-y-1">
              <h2 className="text-lg font-bold tracking-wider uppercase text-slate-900 dark:text-white">
                ORGANISASI KEMAHASISWAAN KAMPUS
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Sekretariat: Kampus Terpadu, Jl. Raya Pendidikan No. 1 • Telp: (021) 1234567
              </p>
            </div>

            {/* Metadata Surat */}
            <div className="flex flex-col sm:flex-row justify-between text-xs text-slate-600 dark:text-slate-400 gap-2 pt-2">
              <div className="space-y-1">
                <p>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Nomor:
                  </span>{" "}
                  {letter.nomorSurat}
                </p>
                <p>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Lampiran:
                  </span>{" "}
                  -
                </p>
                <p>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Perihal:
                  </span>{" "}
                  <strong className="text-slate-900 dark:text-white">
                    {letter.perihal}
                  </strong>
                </p>
              </div>
              <div className="sm:text-right">
                <p>{formatDateLong(letter.tanggalSurat)}</p>
              </div>
            </div>

            {/* Tujuan Surat */}
            <div className="text-xs text-slate-800 dark:text-slate-200 space-y-1 pt-4">
              <p>Kepada Yth,</p>
              <p className="font-bold text-sm">
                {letter.tujuan || "Pihak Terkait"}
              </p>
              <p>Di Tempat</p>
            </div>

            {/* Isi Surat Standar */}
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3 pt-4">
              <p>Dengan hormat,</p>
              <p>
                Sehubungan dengan pelaksanaan kegiatan UKM dan keperluan administrasi
                organisasi, kami mengajukan surat dengan perihal:{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {letter.perihal}
                </span>
                .
              </p>
              <p>
                Demikian surat ini kami sampaikan. Atas perhatian dan kerja sama Bapak/Ibu/Saudara,
                kami ucapkan terima kasih.
              </p>
            </div>

            {/* Tanda Tangan */}
            <div className="pt-12 flex justify-end text-xs text-slate-700 dark:text-slate-300">
              <div className="text-center w-48 space-y-16">
                <p>Hormat kami,</p>
                <div>
                  <p className="font-bold border-b border-slate-400 dark:border-slate-600 pb-1">
                    Pengurus UKM
                  </p>
                  <p className="text-[10px] text-slate-500">Ketua / Sekretaris</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info & Timeline Approval */}
        <div className="lg:col-span-4 space-y-6 print:hidden">
          {/* Card Status & Aksi */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              Status Surat
              <Badge variant={statusVariantMap[letter.status] ?? "secondary"} dot>
                {statusLabelMap[letter.status] ?? letter.status}
              </Badge>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Jenis</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {letter.jenis === "surat_masuk" ? "Surat Masuk" : "Surat Keluar"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Prioritas</span>
                <Badge variant={priorityVariantMap[letter.prioritas] ?? "secondary"} size="sm">
                  {letter.prioritas}
                </Badge>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Dibuat Pada</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {formatDateShort(letter.createdAt)}
                </span>
              </div>
            </div>

            {/* Tombol Aksi Sesuai Status */}
            <div className="pt-2 space-y-2">
              {letter.status === "draft" && (
                <Button
                  className="w-full"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus("diajukan")}
                >
                  <i className="bi bi-send mr-1.5" aria-hidden="true" /> Ajukan Surat
                </Button>
              )}

              {letter.status === "diajukan" && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="success"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus("disetujui")}
                  >
                    <i className="bi bi-check-lg mr-1.5" aria-hidden="true" /> Setujui
                  </Button>
                  <Button
                    variant="danger"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus("ditolak")}
                  >
                    <i className="bi bi-x-lg mr-1.5" aria-hidden="true" /> Tolak
                  </Button>
                </div>
              )}

              {letter.status === "disetujui" && (
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus("diarsip")}
                >
                  <i className="bi bi-archive mr-1.5" aria-hidden="true" /> Arsipkan Surat
                </Button>
              )}
            </div>
          </div>

          {/* Timeline Approval */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i className="bi bi-clock-history text-indigo-600 dark:text-indigo-400" />
              Alur Pengajuan
            </h3>

            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {/* Step 1: Draft Dibuat */}
              <div className="relative text-xs">
                <span className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  Surat Dibuat
                </p>
                <p className="text-[11px] text-slate-500">
                  {formatDateShort(letter.createdAt)}
                </p>
              </div>

              {/* Step 2: Diajukan */}
              <div className="relative text-xs">
                <span
                  className={`absolute -left-6 top-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                    letter.status !== "draft"
                      ? "bg-emerald-500"
                      : "bg-slate-300 dark:bg-slate-700"
                  }`}
                />
                <p
                  className={`font-semibold ${
                    letter.status !== "draft"
                      ? "text-slate-900 dark:text-slate-100"
                      : "text-slate-400"
                  }`}
                >
                  Pengajuan Approval
                </p>
                <p className="text-[11px] text-slate-500">
                  {letter.status !== "draft" ? "Selesai diajukan" : "Menunggu pengajuan"}
                </p>
              </div>

              {/* Step 3: Persetujuan / Penolakan */}
              <div className="relative text-xs">
                <span
                  className={`absolute -left-6 top-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                    letter.status === "disetujui" || letter.status === "diarsip"
                      ? "bg-emerald-500"
                      : letter.status === "ditolak"
                      ? "bg-red-500"
                      : "bg-slate-300 dark:bg-slate-700"
                  }`}
                />
                <p
                  className={`font-semibold ${
                    letter.status === "disetujui" || letter.status === "diarsip"
                      ? "text-success"
                      : letter.status === "ditolak"
                      ? "text-danger"
                      : "text-slate-400"
                  }`}
                >
                  {letter.status === "ditolak" ? "Ditolak" : "Disetujui"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {letter.status === "disetujui" || letter.status === "diarsip"
                    ? "Telah disetujui pimpinan"
                    : letter.status === "ditolak"
                    ? "Pengajuan ditolak"
                    : "Menunggu peninjauan"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
