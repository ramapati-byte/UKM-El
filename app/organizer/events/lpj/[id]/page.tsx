// app/organizer/events/lpj/[id]/page.tsx — Halaman formulir & pengajuan LPJ kegiatan

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Swal from "sweetalert2";
import AppShell from "@/components/shell/AppShell";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardTitle, CardBody, CardFooter } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import Callout from "@/components/ui/Callout";
import LPJStatusTimeline from "@/components/events/LPJStatusTimeline";
import EventReportExport from "@/components/events/EventReportExport";
import { eventService } from "@/services/event.service";
import type { EventEntity, EventCommittee, EventLPJ, LPJAttachment } from "@/types/event";
import { formatRupiah, formatDateLong } from "@/lib/format";

export default function EventLPJPage() {
  const params = useParams();
  const idStr = params.id as string;
  const eventId = Number(idStr);

  const [event, setEvent] = useState<EventEntity | null>(null);
  const [committees, setCommittees] = useState<EventCommittee[]>([]);
  const [lpj, setLpj] = useState<EventLPJ | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [summary, setSummary] = useState("");
  const [participantCount, setParticipantCount] = useState(0);
  const [budgetPlanned, setBudgetPlanned] = useState(0);
  const [budgetRealized, setBudgetRealized] = useState(0);
  const [attachments, setAttachments] = useState<LPJAttachment[]>([]);

  const fetchLPJData = useCallback(async () => {
    if (!eventId || isNaN(eventId)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [ev, comms, lpjData] = await Promise.all([
        eventService.getById(eventId),
        eventService.getCommittees(eventId).catch(() => []),
        eventService.getLPJ(eventId).catch(() => null),
      ]);

      setEvent(ev);
      setCommittees(comms);
      setLpj(lpjData);

      if (lpjData) {
        setSummary(lpjData.summary || "");
        setParticipantCount(lpjData.participant_count || 0);
        setBudgetPlanned(lpjData.budget_planned || 0);
        setBudgetRealized(lpjData.budget_realized || 0);
        setAttachments(lpjData.attachments || []);
      } else if (ev) {
        setParticipantCount(ev.counts?.attendees || 0);
      }
    } catch {
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchLPJData();
  }, [fetchLPJData]);

  // Tambah lampiran berkas tiruan (simulasi upload client)
  const handleAddAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newAtt: LPJAttachment = {
        id: Date.now(),
        filename: file.name,
        url: URL.createObjectURL(file),
        size_kb: Math.round(file.size / 1024),
        uploaded_at: new Date().toISOString(),
      };
      setAttachments((prev) => [...prev, newAtt]);
      e.target.value = "";
    }
  };

  const handleRemoveAttachment = (attId: number) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  const handleSave = async (isSubmit = false) => {
    if (!summary.trim()) {
      Swal.fire("Perhatian", "Silakan isi ringkasan pelaksanaan kegiatan terlebih dahulu.", "warning");
      return;
    }

    if (isSubmit) {
      const confirm = await Swal.fire({
        title: "Ajukan LPJ Resmi?",
        text: "LPJ yang diajukan akan dikirim ke pihak Kemahasiswaan / BEM untuk diverifikasi dan disahkan.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Ajukan LPJ",
        cancelButtonText: "Batal",
      });
      if (!confirm.isConfirmed) return;
    }

    setSaving(true);
    try {
      const updated = await eventService.saveLPJ(eventId, {
        summary,
        participant_count: participantCount,
        budget_planned: budgetPlanned,
        budget_realized: budgetRealized,
        submit: isSubmit,
      });

      // Update attachments di state lokal
      updated.attachments = attachments;
      setLpj(updated);

      Swal.fire({
        icon: "success",
        title: isSubmit ? "LPJ Berhasil Diajukan!" : "Draft LPJ Tersimpan",
        text: isSubmit
          ? "Laporan telah masuk antrean peninjauan Kemahasiswaan."
          : "Perubahan draft berhasil disimpan.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan LPJ.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell
        title="Memuat Form LPJ..."
        breadcrumbs={[
          { label: "Dashboard", href: "/organizer/dashboard" },
          { label: "Kelola Event", href: "/organizer/events" },
          { label: "LPJ" },
        ]}
      >
        <div className="space-y-6">
          <LoadingSkeleton variant="table" rows={4} />
        </div>
      </AppShell>
    );
  }

  if (!event) {
    return (
      <AppShell
        title="Event Tidak Ditemukan"
        breadcrumbs={[
          { label: "Dashboard", href: "/organizer/dashboard" },
          { label: "Kelola Event", href: "/organizer/events" },
          { label: "Error" },
        ]}
      >
        <EmptyState
          icon="bi-exclamation-triangle"
          title="Event Tidak Ditemukan"
          message="Data event untuk penyusunan LPJ tidak tersedia."
          action={
            <Link href="/organizer/events">
              <Button variant="primary" icon="bi-arrow-left">
                Kembali ke Daftar Event
              </Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  const isApproved = lpj?.status === "approved";

  return (
    <AppShell
      title={`Laporan Pertanggungjawaban (LPJ)`}
      subtitle={`Event: "${event.title}" • ${event.ukm_name || "BEM El Rahma"}`}
      breadcrumbs={[
        { label: "Dashboard", href: "/organizer/dashboard" },
        { label: "Kelola Event", href: "/organizer/events" },
        { label: `Event #${event.id}`, href: `/organizer/events/detail/${event.id}` },
        { label: "LPJ Kegiatan" },
      ]}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <EventReportExport event={event} committees={committees} lpj={lpj} />
          <Link href={`/organizer/events/detail/${event.id}`}>
            <Button variant="outline" size="sm" icon="bi-arrow-left">
              Detail Hub
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Banner Status Pengesahan */}
        {isApproved && (
          <Callout
            variant="success"
            title="LPJ Kegiatan Ini Telah Resmi Disahkan!"
            icon="bi-patch-check-fill"
          >
            Laporan pertanggungjawaban kegiatan telah disetujui dan diverifikasi oleh pihak Kemahasiswaan. Angka realisasi telah dibukukan secara permanen.
          </Callout>
        )}

        {/* 2 Kolom: Kiri (Form LPJ) & Kanan (Timeline Status & Rekap) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Formulir LPJ (7 kolom) */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle icon="bi-file-earmark-text-fill">
                  Formulir Laporan Pertanggungjawaban
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">
                    Status: <b className="uppercase">{lpj?.status || "Draft"}</b>
                  </span>
                </div>
              </CardHeader>

              <CardBody className="space-y-5">
                {/* 1. Ringkasan Pelaksanaan */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Ringkasan Pelaksanaan Kegiatan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    disabled={isApproved}
                    placeholder="Uraikan jalannya kegiatan, pencapaian target, kendala yang dihadapi, serta evaluasi umum pelaksanaan..."
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50 dark:disabled:bg-slate-800/60 transition"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Jelaskan secara ringkas dan objektif untuk bahan evaluasi BEM/Kemahasiswaan.
                  </p>
                </div>

                {/* 2. Jumlah Peserta Hadir */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Jumlah Peserta Hadir (Presensi Aktual)
                  </label>
                  <div className="relative max-w-xs">
                    <Input
                      type="number"
                      min={0}
                      value={participantCount}
                      onChange={(e) => setParticipantCount(Number(e.target.value))}
                      disabled={isApproved}
                      icon="bi-people"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Otomatis sinkron dengan hasil scan presensi QR (Total pendaftar: {event.counts?.registrants || 0} orang).
                  </p>
                </div>

                {/* 3. Anggaran Rencana vs Realisasi Aktual */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Anggaran Rencana (Rp)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={budgetPlanned}
                      onChange={(e) => setBudgetPlanned(Number(e.target.value))}
                      disabled={isApproved}
                      icon="bi-cash"
                      placeholder="0"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      {formatRupiah(budgetPlanned)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Realisasi Pengeluaran (Rp)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={budgetRealized}
                      onChange={(e) => setBudgetRealized(Number(e.target.value))}
                      disabled={isApproved}
                      icon="bi-receipt"
                      placeholder="0"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      {formatRupiah(budgetRealized)}
                    </p>
                  </div>
                </div>

                {/* Selisih Anggaran */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    Selisih Anggaran (Rencana - Realisasi):
                  </span>
                  <span
                    className={`font-bold text-sm ${
                      budgetPlanned - budgetRealized >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatRupiah(budgetPlanned - budgetRealized)}
                  </span>
                </div>

                {/* 4. Unggah Lampiran Berkas LPJ */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Lampiran Berkas LPJ ({attachments.length})
                      </label>
                      <p className="text-[11px] text-slate-400">
                        Upload nota pengeluaran, laporan keuangan PDF, atau foto kegiatan.
                      </p>
                    </div>

                    {!isApproved && (
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition">
                        <i className="bi bi-paperclip text-sm" aria-hidden="true" />
                        <span>Unggah Berkas</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.docx"
                          onChange={handleAddAttachment}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {attachments.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                      Belum ada lampiran diunggah. Klik tombol &ldquo;Unggah Berkas&rdquo; di atas.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {attachments.map((att) => (
                        <div
                          key={att.id}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <i className="bi bi-file-earmark-pdf text-indigo-600 text-base" aria-hidden="true" />
                            <div className="truncate">
                              <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                                {att.filename}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {att.size_kb} KB • Diunggah {formatDateLong(att.uploaded_at)}
                              </p>
                            </div>
                          </div>

                          {!isApproved && (
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(att.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 transition"
                              title="Hapus berkas"
                            >
                              <i className="bi bi-trash" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardBody>

              <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <Link href={`/organizer/events/detail/${event.id}`}>
                  <Button variant="ghost" size="sm" icon="bi-arrow-left">
                    Kembali
                  </Button>
                </Link>

                {!isApproved && (
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      loading={saving}
                      icon="bi-floppy"
                      onClick={() => handleSave(false)}
                    >
                      Simpan Draft
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      loading={saving}
                      icon="bi-send-fill"
                      className="font-bold"
                      onClick={() => handleSave(true)}
                    >
                      Ajukan LPJ Resmi
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>

          {/* Kolom Kanan: Timeline & Panduan Pengesahan (5 kolom) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Visual Timeline Pengesahan */}
            <Card>
              <CardBody>
                <LPJStatusTimeline lpj={lpj} />
              </CardBody>
            </Card>

            {/* Rekap Keuangan Terhubung */}
            <Card>
              <CardHeader>
                <CardTitle icon="bi-cash-coin">Rekap Tiket & Kas Event</CardTitle>
              </CardHeader>
              <CardBody className="space-y-3 text-xs">
                <p className="text-slate-600 dark:text-slate-300">
                  Data kas kegiatan terhubung langsung dengan sistem registrasi tiket dan denda peserta:
                </p>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tipe Registrasi:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 capitalize">{event.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Harga Tiket:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{formatRupiah(event.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Pendaftar:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{event.counts?.registrants || 0} Orang</span>
                  </div>
                </div>

                <Link href={`/organizer/pendaftar/${event.id}/keuangan`} className="block pt-1">
                  <Button variant="outline" size="sm" icon="bi-box-arrow-up-right" className="w-full">
                    Buka Rincian Kas & Denda
                  </Button>
                </Link>
              </CardBody>
            </Card>

            {/* Checklist Syarat Pengesahan LPJ */}
            <Card>
              <CardHeader>
                <CardTitle icon="bi-check2-all">Panduan Syarat Pengesahan</CardTitle>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-none p-0 m-0">
                  <li className="flex items-start gap-2">
                    <i className="bi bi-check-circle-fill text-emerald-500 mt-0.5 shrink-0" aria-hidden="true" />
                    <span>Kegiatan telah selesai dilaksanakan secara penuh.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="bi bi-check-circle-fill text-emerald-500 mt-0.5 shrink-0" aria-hidden="true" />
                    <span>Presensi peserta telah diverifikasi melalui scan QR.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="bi bi-check-circle-fill text-emerald-500 mt-0.5 shrink-0" aria-hidden="true" />
                    <span>Rincian anggaran rencana & realisasi pengeluaran tercatat jelas.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="bi bi-check-circle-fill text-emerald-500 mt-0.5 shrink-0" aria-hidden="true" />
                    <span>Lampiran nota dan dokumentasi kegiatan telah diunggah.</span>
                  </li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
