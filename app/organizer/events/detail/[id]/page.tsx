// app/organizer/events/detail/[id]/page.tsx — Hub Detail Manajemen Event

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Swal from "sweetalert2";
import AppShell from "@/components/shell/AppShell";
import Button from "@/components/ui/Button";
import Card, { CardBody, CardFooter } from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import EventStatCards from "@/components/events/EventStatCards";
import EventStatusBadge from "@/components/events/EventStatusBadge";
import CommitteeTable from "@/components/events/CommitteeTable";
import CommitteeFormModal from "@/components/events/CommitteeFormModal";
import AttendanceSummary from "@/components/events/AttendanceSummary";
import CertificateCommitteeSection from "@/components/events/CertificateCommitteeSection";
import EventReportExport from "@/components/events/EventReportExport";
import { eventService } from "@/services/event.service";
import type { EventEntity, EventCommittee, EventLPJ } from "@/types/event";
import {
  formatRupiah,
  formatDateLong,
  formatTime,
} from "@/lib/format";
import { getBackendBaseUrl } from "@/lib/env";

export default function EventDetailHubPage() {
  const params = useParams();
  const idStr = params.id as string;
  const eventId = Number(idStr);

  const [event, setEvent] = useState<EventEntity | null>(null);
  const [committees, setCommittees] = useState<EventCommittee[]>([]);
  const [lpj, setLpj] = useState<EventLPJ | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [modalOpen, setModalOpen] = useState(false);

  const encodedId = btoa(String(eventId));

  const fetchHubData = useCallback(async () => {
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
    } catch {
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchHubData();
  }, [fetchHubData]);

  const handleDeleteCommittee = async (c: EventCommittee) => {
    const confirm = await Swal.fire({
      title: "Hapus Panitia?",
      text: `Apakah Anda yakin ingin menghapus ${c.name} dari kepanitiaan event ini?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      await eventService.removeCommittee(c.id);
      setCommittees((prev) => prev.filter((item) => item.id !== c.id));
      Swal.fire({
        icon: "success",
        title: "Dihapus!",
        text: `${c.name} berhasil dihapus dari kepanitiaan.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire("Gagal", "Gagal menghapus panitia dari server.", "error");
    }
  };

  const handleAddCommitteeSuccess = (newMember: EventCommittee) => {
    setCommittees((prev) => [newMember, ...prev]);
    Swal.fire({
      icon: "success",
      title: "Berhasil Ditambahkan!",
      text: `${newMember.name} telah terdaftar sebagai panitia.`,
      timer: 1800,
      showConfirmButton: false,
    });
  };

  const tabs = [
    { id: "overview", label: "Ringkasan Event", icon: "bi-info-circle-fill" },
    { id: "attendance", label: "Presensi & Kehadiran", icon: "bi-qr-code-scan" },
    { id: "committee", label: "Panitia Pelaksana", icon: "bi-person-badge", count: committees.length },
    { id: "certificates", label: "Sertifikat Panitia", icon: "bi-award-fill" },
    { id: "features", label: "Fitur & Modul Terhubung", icon: "bi-grid-fill" },
  ];

  if (loading) {
    return (
      <AppShell
        title="Memuat Detail Event..."
        breadcrumbs={[
          { label: "Dashboard", href: "/organizer/dashboard" },
          { label: "Kelola Event", href: "/organizer/events" },
          { label: "Memuat..." },
        ]}
      >
        <div className="space-y-6">
          <LoadingSkeleton variant="table" rows={4} />
          <LoadingSkeleton variant="card" count={3} />
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
          message="Data event yang Anda cari tidak tersedia atau Anda tidak memiliki akses ke event ini."
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

  const posterSrc = event.poster_url
    ? event.poster_url.startsWith("http")
      ? event.poster_url
      : `${getBackendBaseUrl()}${event.poster_url.startsWith("/") ? "" : "/"}${event.poster_url}`
    : null;

  return (
    <AppShell
      title={event.title}
      subtitle={`ID #${event.id} • ${event.ukm_name || "BEM El Rahma"} • ${formatDateLong(event.starts_at)}`}
      breadcrumbs={[
        { label: "Dashboard", href: "/organizer/dashboard" },
        { label: "Kelola Event", href: "/organizer/events" },
        { label: `Event #${event.id}` },
      ]}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {event.visibility === "public" && event.status === "approved" && (
            <Link href={`/events/${event.id}`} target="_blank">
              <Button variant="outline" size="sm" icon="bi-box-arrow-up-right">
                Halaman Publik
              </Button>
            </Link>
          )}

          <Link href={`/organizer/events/lpj/${event.id}`}>
            <Button variant="outline" size="sm" icon="bi-file-earmark-text">
              LPJ Kegiatan
            </Button>
          </Link>

          <EventReportExport event={event} committees={committees} lpj={lpj} />

          <Link href={`/organizer/events/edit/${encodedId}`}>
            <Button variant="outline" size="sm" icon="bi-pencil">
              Edit Event
            </Button>
          </Link>

          <Link href={`/organizer/pendaftar/${event.id}/scan`}>
            <Button variant="primary" size="sm" icon="bi-qr-code-scan" className="font-bold">
              Scan Presensi
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Metrik Statistik Cepat (4 StatCard) */}
        <EventStatCards
          event={event}
          committeesCount={committees.length}
          lpjStatus={lpj?.status}
        />

        {/* Tab Navigasi Hub */}
        <Card>
          <div className="px-5 pt-2">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          <CardBody>
            {/* TAB 1: Ringkasan Event */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  {/* Poster Preview */}
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 aspect-video lg:aspect-[4/3] relative">
                    {posterSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={posterSrc}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-slate-400">
                        <i className="bi bi-image text-4xl mb-2" aria-hidden="true" />
                        <span className="text-xs font-semibold">Belum ada poster</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <EventStatusBadge status={event.status} size="sm" />
                    </div>
                  </div>

                  {/* Informasi Detail */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1">
                        <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                          Waktu Pelaksanaan
                        </p>
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          {formatDateLong(event.starts_at)}
                        </p>
                        <p className="text-slate-500">
                          Pukul {formatTime(event.starts_at)}
                          {event.ends_at && ` - ${formatTime(event.ends_at)}`}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1">
                        <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                          Lokasi & Ruangan
                        </p>
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          {event.location}
                        </p>
                        <p className="text-slate-500">
                          {event.room_name ? `Ruangan: ${event.room_name}` : "Ruangan Mandiri"}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1">
                        <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                          Tipe & Biaya Registrasi
                        </p>
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          {event.type === "free" ? "Gratis (Free)" : formatRupiah(event.price)}
                        </p>
                        <p className="text-slate-500">
                          Visibilitas: <span className="capitalize font-semibold">{event.visibility}</span>
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1">
                        <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                          Kebijakan Denda
                        </p>
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          {event.penalty_amount > 0 ? formatRupiah(event.penalty_amount) : "Tidak Ada Denda"}
                        </p>
                        <p className="text-slate-500">
                          {event.penalty_amount > 0 ? "Denda jika mangkir tanpa kabar" : "Bebas denda kehadiran"}
                        </p>
                      </div>
                    </div>

                    {/* Deskripsi */}
                    <div className="space-y-1.5 pt-2">
                      <p className="font-bold text-xs uppercase tracking-wider text-slate-500">
                        Deskripsi Kegiatan:
                      </p>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sponsor */}
                {event.sponsors && event.sponsors.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <p className="font-bold text-xs uppercase tracking-wider text-slate-500">
                      Sponsor & Mitra Event ({event.sponsors.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {event.sponsors.map((sp) => (
                        <span
                          key={sp.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                        >
                          <i className="bi bi-award-fill text-amber-500" aria-hidden="true" />
                          <span>{sp.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Presensi & Kehadiran Peserta */}
            {activeTab === "attendance" && (
              <AttendanceSummary
                eventId={event.id}
                penaltyAmount={event.penalty_amount}
              />
            )}

            {/* TAB 3: Kepanitiaan Event */}
            {activeTab === "committee" && (
              <CommitteeTable
                committees={committees}
                onAddClick={() => setModalOpen(true)}
                onDeleteClick={handleDeleteCommittee}
                canManage={true}
              />
            )}

            {/* TAB 4: Sertifikat Panitia Pelaksana */}
            {activeTab === "certificates" && (
              <CertificateCommitteeSection
                event={event}
                committees={committees}
              />
            )}

            {/* TAB 3: Modul & Fitur Terhubung */}
            {activeTab === "features" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
                    Pusat Kontrol Fitur Event
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Akses cepat ke konfigurasi formulir, evaluasi kuesioner, template sertifikat, dan rekap keuangan event ini.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* 1. Atur Form Pendaftaran */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3 shadow-xs hover:border-indigo-400 transition">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center text-lg shrink-0">
                        <i className="bi bi-ui-checks" aria-hidden="true" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">Formulir Khusus</h5>
                        <p className="text-xs text-slate-500 mt-0.5">Kelola field formulir pendaftaran dinamis.</p>
                      </div>
                    </div>
                    <Link href={`/organizer/events/form/${encodedId}`}>
                      <Button variant="outline" size="sm" icon="bi-gear" className="w-full">
                        Atur Form
                      </Button>
                    </Link>
                  </div>

                  {/* 2. Kuesioner Evaluasi */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3 shadow-xs hover:border-indigo-400 transition">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 flex items-center justify-center text-lg shrink-0">
                        <i className="bi bi-question-circle" aria-hidden="true" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">Kuesioner Feedback</h5>
                        <p className="text-xs text-slate-500 mt-0.5">Pertanyaan evaluasi kepuasan peserta.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/organizer/events/kuesioner/${encodedId}`} className="flex-1">
                        <Button variant="outline" size="sm" icon="bi-pencil" className="w-full">
                          Pertanyaan
                        </Button>
                      </Link>
                      <Link href={`/organizer/events/hasil-kuesioner/${encodedId}`} className="flex-1">
                        <Button variant="outline" size="sm" icon="bi-bar-chart" className="w-full">
                          Hasil
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* 3. Sertifikat Peserta */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3 shadow-xs hover:border-indigo-400 transition">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center text-lg shrink-0">
                        <i className="bi bi-award" aria-hidden="true" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">E-Sertifikat</h5>
                        <p className="text-xs text-slate-500 mt-0.5">Template & tata letak nomor sertifikat otomatis.</p>
                      </div>
                    </div>
                    <Link href={`/organizer/events/sertifikat/${encodedId}`}>
                      <Button variant="outline" size="sm" icon="bi-file-earmark-pdf" className="w-full">
                        Atur Sertifikat
                      </Button>
                    </Link>
                  </div>

                  {/* 4. Kelola Adson / Merchandise */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3 shadow-xs hover:border-indigo-400 transition">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center text-lg shrink-0">
                        <i className="bi bi-gift" aria-hidden="true" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">Add-on / Merchandise</h5>
                        <p className="text-xs text-slate-500 mt-0.5">Kaos, stiker, dan opsi barang tambahan.</p>
                      </div>
                    </div>
                    <Link href={`/organizer/events/adson/${encodedId}`}>
                      <Button variant="outline" size="sm" icon="bi-box-seam" className="w-full">
                        Kelola Add-on
                      </Button>
                    </Link>
                  </div>

                  {/* 5. Rekap Keuangan Event */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3 shadow-xs hover:border-indigo-400 transition">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center text-lg shrink-0">
                        <i className="bi bi-cash-stack" aria-hidden="true" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">Rekap Keuangan</h5>
                        <p className="text-xs text-slate-500 mt-0.5">Laporan pemasukan tiket & denda event.</p>
                      </div>
                    </div>
                    <Link href={`/organizer/pendaftar/${event.id}/keuangan`}>
                      <Button variant="outline" size="sm" icon="bi-receipt" className="w-full">
                        Lihat Keuangan
                      </Button>
                    </Link>
                  </div>

                  {/* 6. Scan Presensi QR */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3 shadow-xs hover:border-indigo-400 transition">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center text-lg shrink-0">
                        <i className="bi bi-qr-code-scan" aria-hidden="true" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">Presensi Scan QR</h5>
                        <p className="text-xs text-slate-500 mt-0.5">Scan tiket peserta pada hari pelaksanaan.</p>
                      </div>
                    </div>
                    <Link href={`/organizer/pendaftar/${event.id}/scan`}>
                      <Button variant="primary" size="sm" icon="bi-camera" className="w-full font-bold">
                        Buka Kamera Scanner
                      </Button>
                    </Link>
                  </div>

                  {/* 7. Form & Pengesahan LPJ */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3 shadow-xs hover:border-amber-400 transition">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center text-lg shrink-0">
                        <i className="bi bi-file-earmark-check" aria-hidden="true" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">LPJ & Pelaporan</h5>
                        <p className="text-xs text-slate-500 mt-0.5">Formulir realisasi, lampiran nota, dan timeline.</p>
                      </div>
                    </div>
                    <Link href={`/organizer/events/lpj/${event.id}`}>
                      <Button variant="outline" size="sm" icon="bi-send-check" className="w-full font-bold text-amber-700 hover:bg-amber-50">
                        Buka Form LPJ
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </CardBody>

          <CardFooter>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Detail Hub Event Terintegrasi</span>
            </div>
            <Link href="/organizer/events">
              <Button size="sm" variant="ghost" icon="bi-arrow-left">
                Kembali ke Daftar Event
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Modal Tambah Panitia */}
        <CommitteeFormModal
          open={modalOpen}
          eventId={event.id}
          onClose={() => setModalOpen(false)}
          onSuccess={handleAddCommitteeSuccess}
        />
      </div>
    </AppShell>
  );
}
