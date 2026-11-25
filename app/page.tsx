"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBackendBaseUrl } from "@/lib/axios";
import api from "@/lib/axios";
import PublicShell from "@/components/shell/PublicShell";
import Card, { CardBody } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import Button from "@/components/ui/Button";
import EventCard from "@/components/events/EventCard";
import type { EventEntity } from "@/types/event";

interface RawWorkshop {
  id: number;
  judul: string;
  poster: string | null;
  tipe_event?: string;
  harga: number;
  ukm_penyelenggara?: string;
  nama_penyelenggara?: string;
  penyelenggara_id?: number;
  tanggal_waktu: string;
  jam_selesai?: string | null;
  lokasi: string;
  deskripsi?: string;
  visibilitas?: string;
  maksimal_peserta?: number;
  status?: string;
}

const FEATURES = [
  {
    title: "Keanggotaan & Rekrutmen Digital",
    description:
      "Open recruitment dengan form kustom per UKM, pipeline seleksi bertahap (daftar → verifikasi → seleksi → pengumuman), database anggota aktif, dan kartu anggota QR resmi.",
    icon: "bi-person-badge",
    accent: "text-sky-600 dark:text-sky-400",
    iconBg: "bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400",
  },
  {
    title: "Administrasi & Surat-menyurat",
    description:
      "Buat, ajukan, dan arsipkan surat organisasi dengan nomor otomatis, alur persetujuan digital, dan pencarian arsip. Tanpa bolak-balik fisik, tanpa berkas menumpuk.",
    icon: "bi-file-earmark-text",
    accent: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Keuangan & Program Kerja",
    description:
      "Catat kas UKM, ajukan anggaran kegiatan, pantau realisasi proker per periode, dan ekspor laporan LPJ langsung dari sistem — tanpa spreadsheet berhamburan.",
    icon: "bi-graph-up-arrow",
    accent: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400",
  },
];

const UKM_CATEGORIES = [
  { name: "Ketua UKM & Pengurus", icon: "bi-person-gear", count: "Dashboard & Approval", desc: "Kelola struktur org, approve event, pantau proker, dan buat laporan LPJ langsung dari sistem." },
  { name: "Pengurus Inti & Divisi", icon: "bi-people-fill", count: "Administrasi Harian", desc: "Urus keanggotaan, surat, kas UKM, inventaris, dan rekrutmen anggota baru dalam satu tempat." },
  { name: "Mahasiswa & Anggota", icon: "bi-mortarboard", count: "Portal Anggota", desc: "Ikuti event, unduh tiket QR, kumpulkan e-sertifikat, dan akses kartu anggota digital kapan saja." },
  { name: "Kemahasiswaan / Admin", icon: "bi-shield-check", count: "Pusat Kontrol", desc: "Pantau semua UKM, verifikasi organisasi, audit log aktivitas, dan lihat peringkat kinerja ormawa." },
];

const MISI = [
  "Mengembangkan potensi kepemimpinan mahasiswa melalui tata kelola organisasi modern.",
  "Membangun kolaborasi strategis lintas UKM, komunitas akademik, dan alumni kampus.",
  "Menyelenggarakan kegiatan inovatif berskala regional dan nasional secara berkala.",
  "Mendigitalisasi birokrasi perizinan, pendanaan, dan sertifikasi kegiatan kampus.",
];

function mapToEventEntity(w: RawWorkshop): EventEntity {
  const isFree = !w.harga || w.harga === 0 || w.tipe_event === "gratis";
  const posterUrl = w.poster
    ? w.poster.startsWith("http")
      ? w.poster
      : `${getBackendBaseUrl()}/uploads/${w.poster.replace(/^\/uploads\//, "").replace(/^\//, "")}`
    : null;

  return {
    id: w.id,
    ukm_id: String(w.penyelenggara_id || 1),
    ukm_name: w.ukm_penyelenggara || w.nama_penyelenggara || "BEM El Rahma",
    title: w.judul || "Event Kampus",
    description: w.deskripsi || "",
    poster_url: posterUrl,
    starts_at: w.tanggal_waktu,
    ends_at: w.jam_selesai || null,
    location: w.lokasi || "Kampus El Rahma",
    visibility: (w.visibilitas as any) || "public",
    type: isFree ? "free" : "paid",
    price: Number(w.harga) || 0,
    penalty_amount: 0,
    max_participants: w.maksimal_peserta || 0,
    status: (w.status as any) || "approved",
    created_by: w.penyelenggara_id || 1,
    created_at: w.tanggal_waktu || new Date().toISOString(),
  };
}

export default function Home() {
  const [workshops, setWorkshops] = useState<EventEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const response = await api.get("/events");
        const rawData: RawWorkshop[] = Array.isArray(response.data) ? response.data : [];
        setWorkshops(rawData.map(mapToEventEntity));
      } catch (error) {
        console.error("Failed to fetch workshops:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  return (
    <PublicShell brandTitle="BEM El Rahma">
      {/* =========================================================================
          HERO SECTION (NATURAL PROPORTIONS, NO RIGID 100vh OVERFLOW)
          ========================================================================= */}
      <section className="relative w-full py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-rose-50/40 via-white to-slate-50/60 dark:from-slate-900/80 dark:via-slate-950 dark:to-slate-950 border-b border-rose-100/70 dark:border-slate-800/80 overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-1/4 -mt-10 w-96 h-96 bg-gradient-to-br from-amber-300/20 via-rose-300/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-rose-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Headline & Action Calls */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Official Portal Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 border border-rose-200/80 dark:border-rose-900/50 shadow-2xs backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
                <span className="text-xs font-bold bg-gradient-to-r from-rose-600 via-amber-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-wider">
                  Sistem Manajemen Ormawa — Kampus El Rahma
                </span>
              </div>

              {/* Inspiring Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-[1.14]">
                Satu Platform untuk{" "}
                <span className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 bg-clip-text text-transparent">
                  Semua UKM
                </span>
                <br className="hidden sm:inline" /> &amp; Ormawa Kampus
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
                Kelola keanggotaan, keuangan, surat-menyurat, dan kegiatan seluruh organisasi mahasiswa dalam satu sistem terpadu. Dari rekrutmen anggota baru hingga laporan LPJ — semua digital, semua terintegrasi.
              </p>

              {/* Vibrant Action Button Row */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
                <Link href="/login">
                  <Button
                    variant="sunrise"
                    size="lg"
                    icon="bi-speedometer2"
                    className="rounded-2xl px-6 py-3 font-bold shadow-md shadow-rose-500/15"
                  >
                    Masuk ke Dashboard
                  </Button>
                </Link>

                <Link href="/ukm">
                  <Button
                    variant="outline"
                    size="lg"
                    icon="bi-buildings"
                    className="rounded-2xl px-6 py-3 bg-white/90 dark:bg-slate-900/90 font-bold border-slate-300 dark:border-slate-700"
                  >
                    Daftarkan UKM
                  </Button>
                </Link>

                <Link href="/events">
                  <Button
                    variant="ghost"
                    size="lg"
                    icon="bi-calendar-event"
                    className="rounded-2xl px-5 py-3 font-bold text-slate-700 dark:text-slate-300 hover:text-rose-600"
                  >
                    Lihat Event Publik
                  </Button>
                </Link>
              </div>

              {/* Live Trust Metrics Row */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 border-t border-rose-100/80 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <i className="bi bi-shield-check text-base" aria-hidden="true" />
                  </div>
                  <div className="text-left">
                    <p className="font-extrabold text-slate-900 dark:text-slate-100 leading-none">100% Terverifikasi</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Resmi BEM &amp; Kampus</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                    <i className="bi bi-qr-code-scan text-base" aria-hidden="true" />
                  </div>
                  <div className="text-left">
                    <p className="font-extrabold text-slate-900 dark:text-slate-100 leading-none">Paperless &amp; QR</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tiket &amp; E-Sertifikat</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <i className="bi bi-people-fill text-base" aria-hidden="true" />
                  </div>
                  <div className="text-left">
                    <p className="font-extrabold text-slate-900 dark:text-slate-100 leading-none">Multi-Organisasi</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">UKM, HIMA &amp; Komunitas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Authentic Campus Life Photo Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Floating Tactile Badges */}
                <div className="absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-rose-200/80 dark:border-slate-700 shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Presensi QR Cerdas</span>
                </div>

                <div className="absolute -bottom-3 -left-3 z-20 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg flex items-center gap-2">
                  <i className="bi bi-patch-check-fill text-sm" aria-hidden="true" />
                  <span className="text-xs font-extrabold">E-Sertifikat Resmi</span>
                </div>

                {/* Main Showcase Image Frame */}
                <div className="relative rounded-3xl overflow-hidden border border-rose-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-rose-500/5 group">
                  <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/sunat_bareng.jpeg"
                      alt="Dokumentasi Kegiatan Pengabdian BEM El Rahma"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none" />
                  </div>

                  <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
                      <i className="bi bi-award-fill" aria-hidden="true" />
                      <span>Aksi Nyata BEM El Rahma</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-100 leading-snug">
                      Kegiatan sosial pengabdian masyarakat &amp; program kolaborasi aktif mahasiswa kampus.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CAMPUS KEY METRICS STRIP
          ========================================================================= */}
      <section className="border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
              13 Modul
            </p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">Manajemen UKM Lengkap</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">
              10+ Ormawa
            </p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">UKM &amp; HIMA Terintegrasi</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-500 to-rose-600 bg-clip-text text-transparent">
              Rekrutmen QR
            </p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">Anggota Digital &amp; Paperless</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">
              LPJ Otomatis
            </p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">Surat &amp; Administrasi Digital</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MAIN CONTENT CONTAINER
          ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 space-y-20 pb-28">
        {/* =======================================================================
            AGENDA TERKINI / EVENT SHOWCASE (USING EVENTCARD)
            ======================================================================= */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                Agenda Kampus
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
                Kegiatan &amp; Workshop Mendatang
              </h2>
            </div>

            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 transition-colors group"
            >
              <span>Lihat Semua Event ({workshops.length})</span>
              <i className="bi bi-arrow-right transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <LoadingSkeleton variant="card" count={3} />
          ) : workshops.length === 0 ? (
            <EmptyState
              icon="bi-calendar-x"
              title="Belum Ada Kegiatan Baru"
              message="Nantikan agenda seru lainnya dari BEM dan UKM El Rahma dalam waktu dekat!"
              action={
                <Link href="/events">
                  <Button variant="outline" size="sm" icon="bi-arrow-clockwise">
                    Muat Ulang Katalog
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {workshops.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        {/* =======================================================================
            PROGRAM UNGGULAN (FEATURES)
            ======================================================================= */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                Fitur Utama Platform
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
                Lebih dari Sekadar Portal Event
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
              Platform pengelolaan organisasi mahasiswa terpadu — dari rekrutmen anggota baru hingga laporan LPJ akhir masa jabatan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature, idx) => (
              <Card key={idx} hoverable className="rounded-2xl p-6 space-y-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-2xs ${feature.iconBg}`}>
                  <i className={`bi ${feature.icon}`} aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* =======================================================================
            DIREKTORI UKM & ORMAWA SPOTLIGHT
            ======================================================================= */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Untuk Siapa Platform Ini?
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
                Dirancang untuk Semua Pemangku Ormawa
              </h2>
            </div>

            <Link
              href="/ukm"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 transition-colors group"
            >
              <span>Lihat Seluruh UKM</span>
              <i className="bi bi-arrow-right transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {UKM_CATEGORIES.map((cat, idx) => (
              <Card key={idx} hoverable className="rounded-2xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center text-lg">
                  <i className={`bi ${cat.icon}`} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{cat.name}</h3>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-0.5">{cat.count}</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {cat.desc}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* =======================================================================
            TENTANG BEM EL RAHMA & VISI MISI
            ======================================================================= */}
        <section className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: About BEM & Photo */}
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Profil Organisasi
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Tentang BEM El Rahma
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Badan Eksekutif Mahasiswa (BEM) El Rahma merupakan lembaga eksekutif tertinggi mahasiswa yang menjadi episentrum kolaborasi, kepemimpinan, dan aksi sosial nyata di lingkungan kampus maupun masyarakat luas.
              </p>

              <div className="pt-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-rose-400 flex items-center justify-center text-lg">
                  <i className="bi bi-shield-check" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-100">Inklusif &amp; Berintegritas</p>
                  <p className="text-[11px] text-slate-400">Menjembatani aspirasi mahasiswa dengan pimpinan kampus</p>
                </div>
              </div>
            </div>

            {/* Right: Visi & Misi Items */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Visi Utama</span>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium leading-relaxed">
                  Menjadi wadah pergerakan dan akselerasi potensi mahasiswa yang berkarakter, solutif, adaptif terhadap perkembangan teknologi, dan berjiwa sosial tinggi.
                </p>
              </div>

              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider block">Empat Misi Penggerak</span>
                {MISI.map((m, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shrink-0 text-xs font-black mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-snug">
                      {m}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================================
            CALL TO ACTION BANNER (GABUNG SEKARANG)
            ======================================================================= */}
        <section className="rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white p-8 sm:p-12 shadow-xl shadow-rose-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Kelola Organisasi Mahasiswa Lebih Efisien
            </h2>
            <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
              Dirancang untuk Ketua UKM, Pengurus Inti, dan Kemahasiswaan yang ingin meninggalkan cara lama: grup WhatsApp sebagai arsip, spreadsheet yang berhamburan, dan berkas surat yang menumpuk. Mulai digitalisasi pengelolaan UKM Anda hari ini.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/register">
              <Button
                variant="outline"
                size="lg"
                icon="bi-buildings"
                className="bg-white text-slate-900 hover:bg-slate-100 font-bold border-transparent rounded-2xl shadow-md"
              >
                Daftarkan UKM Saya
              </Button>
            </Link>

            <Link href="/login">
              <Button
                variant="ghost"
                size="lg"
                icon="bi-box-arrow-in-right"
                className="text-white hover:bg-white/20 font-bold rounded-2xl"
              >
                Masuk Dashboard
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
