// app/preview-ev0/page.tsx — Halaman Pratinjau Interaktif EV-0 (AdminLTE 4 UI Showcase)

"use client";

import { useState } from "react";
import AppShell from "@/components/shell/AppShell";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Badge,
  Input,
  Select,
  Modal,
  DataTable,
  Pagination,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  StatCard,
  Callout,
  Tabs,
} from "@/components/ui";
import { useEvents } from "@/hooks/useEvents";
import type { EventEntity } from "@/types/event";
import { EVENT_STATUS_MAP } from "@/types/event";
import { formatRupiah, formatDateShort } from "@/lib/format";

export default function PreviewEV0Page() {
  const [activeTab, setActiveTab] = useState("table");
  const [modalOpen, setModalOpen] = useState(false);
  const [calloutDismissed, setCalloutDismissed] = useState(false);

  // Hook query data mock
  const {
    events,
    pagination,
    loading,
    setSearch,
    setPage,
    query,
  } = useEvents({ limit: 5 });

  const tabs = [
    { id: "table", label: "DataTable & Mock Data", icon: "bi-table", count: events.length },
    { id: "components", label: "Tombol & Badge", icon: "bi-ui-checks" },
    { id: "forms", label: "Form & Dialog", icon: "bi-input-cursor-text" },
    { id: "states", label: "Status & Skeleton", icon: "bi-hourglass-split" },
  ];

  const tableColumns = [
    {
      key: "title",
      header: "Nama Event & Lokasi",
      render: (row: EventEntity) => (
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-100">{row.title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
            <i className="bi bi-geo-alt text-indigo-500" aria-hidden="true" />
            <span>{row.location}</span>
            <span>•</span>
            <i className="bi bi-building text-slate-400" aria-hidden="true" />
            <span>{row.ukm_name}</span>
          </p>
        </div>
      ),
    },
    {
      key: "starts_at",
      header: "Jadwal",
      render: (row: EventEntity) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
          <i className="bi bi-calendar-event text-slate-400" aria-hidden="true" />
          {formatDateShort(row.starts_at)}
        </span>
      ),
    },
    {
      key: "type",
      header: "Tipe & Biaya",
      render: (row: EventEntity) => (
        <span className="text-xs font-semibold">
          {row.type === "free" ? (
            <span className="text-emerald-600 dark:text-emerald-400">Gratis</span>
          ) : (
            <span className="text-indigo-600 dark:text-indigo-400">
              {formatRupiah(row.price)}
            </span>
          )}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center" as const,
      render: (row: EventEntity) => {
        const meta = EVENT_STATUS_MAP[row.status] || {
          label: row.status,
          variant: "secondary" as const,
        };
        return (
          <Badge variant={meta.variant} dot size="sm">
            {meta.label}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: "Aksi",
      align: "right" as const,
      render: (row: EventEntity) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            icon="bi-eye"
            onClick={() => alert(`Detail event ID: ${row.id} - ${row.title}`)}
            aria-label="Lihat detail"
          />
          <Button
            size="sm"
            variant="ghost"
            icon="bi-pencil"
            onClick={() => alert(`Edit event ID: ${row.id}`)}
            aria-label="Edit event"
          />
        </div>
      ),
    },
  ];

  return (
    <AppShell
      title="Pratinjau Fondasi EV-0"
      subtitle="Uji coba interaktif komponen UI, AppShell, Theming, dan Mock Adapter AdminLTE 4"
      breadcrumbs={[
        { label: "Dashboard", href: "/organizer/dashboard" },
        { label: "Pratinjau EV-0" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon="bi-arrow-clockwise"
            onClick={() => window.location.reload()}
          >
            Muat Ulang
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon="bi-box-arrow-up-right"
            onClick={() => setModalOpen(true)}
          >
            Buka Dialog
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Banner Callout Panduan */}
        {!calloutDismissed && (
          <Callout
            variant="info"
            title="Fase EV-0 Berhasil Dimuat!"
            icon="bi-info-circle-fill"
            dismissible
            onDismiss={() => setCalloutDismissed(true)}
          >
            Halaman ini mendemonstrasikan seluruh komponen fondasi yang dibangun pada Fase EV-0:
            <b> AppShell AdminLTE 4</b>, <b>Theming (Light/Dark/Auto)</b>, <b>Bootstrap Icons</b>,
            <b> Service & Mock Adapter</b>, dan <b>15 Komponen UI</b>. Coba klik tombol tema di header kanan atas!
          </Callout>
        )}

        {/* Kuartet StatCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Event Aktif"
            value="10"
            icon="bi-calendar-event"
            variant="primary"
            subtitle="Di 3 UKM berbeda"
            trend={{ value: "+2 minggu ini", isUp: true }}
          />
          <StatCard
            title="Total Pendaftar"
            value="373"
            icon="bi-people"
            variant="success"
            subtitle="Tingkat hadir 76%"
            trend={{ value: "+18% naik", isUp: true }}
          />
          <StatCard
            title="Menunggu LPJ"
            value="2"
            icon="bi-file-earmark-text"
            variant="warning"
            subtitle="Event yang telah selesai"
          />
          <StatCard
            title="Ruangan Terpakai"
            value="4 / 4"
            icon="bi-building"
            variant="info"
            subtitle="Kapasitas 600 kursi"
          />
        </div>

        {/* Kontainer Utama Berbasis Card & Tabs */}
        <Card>
          <CardHeader className="border-b-0 pb-0">
            <CardTitle icon="bi-grid-1x2-fill">Showcase Komponen UI</CardTitle>
          </CardHeader>

          <div className="px-5">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          <CardBody>
            {/* TAB 1: DataTable & Mock Data */}
            {activeTab === "table" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="w-full sm:w-72">
                    <Input
                      placeholder="Cari event, topik, atau lokasi..."
                      icon="bi-search"
                      value={query.search || ""}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    <span>Mode Mock In-Memory Aktif</span>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <DataTable
                    columns={tableColumns}
                    data={events}
                    keyExtractor={(row) => row.id}
                    loading={loading}
                    emptyTitle="Tidak ada event ditemukan"
                    emptyMessage="Coba ubah kata kunci pencarian Anda."
                  />
                  {pagination && (
                    <Pagination
                      currentPage={pagination.current_page}
                      totalPages={pagination.total_pages}
                      totalRecords={pagination.total_records}
                      onPageChange={setPage}
                    />
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Tombol & Badge */}
            {activeTab === "components" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Varian Tombol (Button)
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="primary" icon="bi-check-lg">Primary</Button>
                    <Button variant="secondary" icon="bi-gear">Secondary</Button>
                    <Button variant="success" icon="bi-download">Success</Button>
                    <Button variant="danger" icon="bi-trash">Danger</Button>
                    <Button variant="warning" icon="bi-exclamation-triangle">Warning</Button>
                    <Button variant="info" icon="bi-info-circle">Info</Button>
                    <Button variant="outline" icon="bi-box-arrow-up-right">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="primary" loading>Memuat...</Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Ukuran Tombol
                  </h4>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="primary">Small (sm)</Button>
                    <Button size="md" variant="primary">Medium (md)</Button>
                    <Button size="lg" variant="primary">Large (lg)</Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Varian Status Badge (Pill & Dot)
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="primary" dot>Primary</Badge>
                    <Badge variant="success" dot>Approved</Badge>
                    <Badge variant="warning" dot>Pending</Badge>
                    <Badge variant="danger" dot>Rejected</Badge>
                    <Badge variant="info" dot>Draft</Badge>
                    <Badge variant="secondary" dot>Completed</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Kuartet Varian Callout
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Callout variant="info" title="Info">
                      Informasi pembaruan jadwal dan panduan pengisian formulir.
                    </Callout>
                    <Callout variant="success" title="Sukses">
                      Laporan pertanggungjawaban kegiatan telah disetujui.
                    </Callout>
                    <Callout variant="warning" title="Peringatan Bentrok">
                      Jadwal bertabrakan dengan kegiatan UKM lain pada ruangan yang sama.
                    </Callout>
                    <Callout variant="danger" title="Ditolak">
                      Proposal kegiatan tidak memenuhi syarat kuorum minimal peserta.
                    </Callout>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Form & Dialog */}
            {activeTab === "forms" && (
              <div className="space-y-6 max-w-xl">
                <Input
                  label="Judul Event Kegiatan"
                  required
                  placeholder="Contoh: Seminar Nasional AI 2026"
                  icon="bi-pencil-square"
                  helper="Judul akan ditampilkan pada kalender kampus publik"
                />

                <Select
                  label="Pilih Ruangan Kegiatan"
                  required
                  placeholder="-- Pilih Ruangan --"
                  options={[
                    { value: "room-1", label: "Auditorium Utama (Kapasitas 300)" },
                    { value: "room-2", label: "Ruang Seminar Gedung B (Kapasitas 80)" },
                    { value: "room-3", label: "Lab Komputer 1 (Kapasitas 40)" },
                    { value: "room-4", label: "Aula Kemahasiswaan (Kapasitas 150)" },
                  ]}
                  helper="Sistem otomatis memverifikasi ketersediaan jadwal ruangan ini"
                />

                <Input
                  label="Input dengan Pesan Error Validasi"
                  error="Format tanggal mulai tidak boleh lebih awal dari hari ini"
                  defaultValue="2020-01-01"
                  icon="bi-calendar-x"
                />

                <div className="pt-2">
                  <Button
                    variant="primary"
                    icon="bi-window-stack"
                    onClick={() => setModalOpen(true)}
                  >
                    Buka Contoh Modal Dialog
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 4: States & Skeleton */}
            {activeTab === "states" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Empty State
                  </h4>
                  <EmptyState
                    icon="bi-calendar-x"
                    title="Belum Ada Agenda Terdaftar"
                    message="Klik tombol di bawah untuk membuat agenda kegiatan baru di UKM Anda."
                    action={
                      <Button variant="primary" size="sm" icon="bi-plus-lg">
                        Tambah Kegiatan
                      </Button>
                    }
                  />
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Error State
                  </h4>
                  <ErrorState
                    title="Gagal Menghubungkan ke Server"
                    message="Koneksi terputus atau server backend tidak merespons dalam waktu 10 detik."
                    onRetry={() => alert("Coba lagi diklik")}
                  />
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Loading Skeleton (Tabel & Kartu)
                  </h4>
                  <LoadingSkeleton variant="table" rows={3} />
                </div>
              </div>
            )}
          </CardBody>

          <CardFooter>
            <span>AdminLTE 4 UI Kit — Next.js 16 + React 19 + Tailwind 4</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              Fase EV-0 Selesai
            </span>
          </CardFooter>
        </Card>

        {/* Modal Dialog Demo */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Konfirmasi Tindakan Event"
          size="md"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon="bi-check-lg"
                onClick={() => {
                  alert("Aksi berhasil diproses!");
                  setModalOpen(false);
                }}
              >
                Setujui Tindakan
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>
              Ini adalah contoh dialog <b>Modal AdminLTE 4</b> yang responsif:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Di layar desktop tampil sebagai kotak dialog terpusat dengan backdrop blur.</li>
              <li>Di layar mobile (&lt; 640px) otomatis beradaptasi menjadi full-screen.</li>
              <li>Dapat ditutup dengan tombol <b>Escape</b> atau klik di luar backdrop.</li>
            </ul>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
