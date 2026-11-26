"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import AppShell from "@/components/shell/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Callout from "@/components/ui/Callout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { formatDateShort } from "@/lib/format";

interface LegacyArchiveItem {
  id: string;
  kode: string;
  judul: string;
  kategori: "event" | "mahasiswa" | "dokumen" | "keuangan";
  tahun: string;
  penyelenggaraAsal: string;
  statusMigrasi: "migrated" | "archived_only";
  tanggalArsip: string;
}

const MOCK_LEGACY_ARCHIVE: LegacyArchiveItem[] = [
  {
    id: "leg-001",
    kode: "EV-2024-001",
    judul: "Dies Natalis Kampus Ke-25 (Sistem Lama)",
    kategori: "event",
    tahun: "2024",
    penyelenggaraAsal: "BEM El Rahma (Single Org)",
    statusMigrasi: "migrated",
    tanggalArsip: "2024-12-30",
  },
  {
    id: "leg-002",
    kode: "MHS-2023-089",
    judul: "Data Wisudawan Angkatan 2023",
    kategori: "mahasiswa",
    tahun: "2023",
    penyelenggaraAsal: "Kemahasiswaan",
    statusMigrasi: "archived_only",
    tanggalArsip: "2023-11-15",
  },
  {
    id: "leg-003",
    kode: "DOC-2024-012",
    judul: "SK Kepengurusan BEM Periode 2024/2025",
    kategori: "dokumen",
    tahun: "2024",
    penyelenggaraAsal: "BEM El Rahma",
    statusMigrasi: "migrated",
    tanggalArsip: "2024-02-10",
  },
  {
    id: "leg-004",
    kode: "FIN-2024-099",
    judul: "Laporan Pertanggungjawaban Keuangan LKMM-TD 2024",
    kategori: "keuangan",
    tahun: "2024",
    penyelenggaraAsal: "BEM El Rahma",
    statusMigrasi: "migrated",
    tanggalArsip: "2024-10-20",
  },
  {
    id: "leg-005",
    kode: "EV-2023-045",
    judul: "Seminar Nasional Kewirausahaan Pemuda",
    kategori: "event",
    tahun: "2023",
    penyelenggaraAsal: "BEM El Rahma",
    statusMigrasi: "archived_only",
    tanggalArsip: "2023-09-05",
  },
];

export default function LegacyArchivePage() {
  const [data, setData] = useState<LegacyArchiveItem[]>([]);
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("all");

  useEffect(() => {
    api
      .get<{
        data?: Array<{
          id: number;
          judul: string;
          tanggal_waktu?: string;
          ukm_penyelenggara?: string;
          penyelenggara_nama?: string;
          status?: string;
        }>;
      }>("/admin/arsip", { params: { limit: 100 } })
      .then((res) => {
        const rows = res.data?.data ?? [];
        setData(
          rows.map((r) => ({
            id: String(r.id),
            kode: `EV-${r.id}`,
            judul: r.judul,
            kategori: "event",
            tahun: r.tanggal_waktu ? String(new Date(r.tanggal_waktu).getFullYear()) : "-",
            penyelenggaraAsal: r.ukm_penyelenggara || r.penyelenggara_nama || "BEM El Rahma",
            statusMigrasi: r.status === "approved" ? "migrated" : "archived_only",
            tanggalArsip: r.tanggal_waktu || new Date().toISOString(),
          }))
        );
      })
      .catch(() => setData([]));
  }, []);

  const filtered = data.filter((item) => {
    const matchSearch =
      search === "" ||
      item.judul.toLowerCase().includes(search.toLowerCase()) ||
      item.kode.toLowerCase().includes(search.toLowerCase());
    const matchKategori = kategori === "all" || item.kategori === kategori;
    return matchSearch && matchKategori;
  });

  return (
    <AppShell
      title="Arsip Migrasi Data Legacy"
      subtitle="Data historis event, pengguna, dan dokumen dari sistem single-organisasi lama"
      role="superadmin"
      breadcrumbs={[
        { label: "Dashboard", href: "/admin/dashboard" },
        { label: "Arsip Legacy" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader title="Arsip Data Sistem Lama" />

        <Callout variant="info" title="Mode Arsip Read-Only">
          Data pada halaman ini adalah arsip historis dari sistem lama (Event-BEM Single
          Organization) yang dipelihara untuk audit trail dan integritas rekam jejak.
          Data ini bersifat <b>read-only</b> dan tidak dapat diubah atau dihapus.
        </Callout>

        {/* Filter bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Pencarian
              </label>
              <Input
                placeholder="Cari kode atau judul arsip..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Kategori Data
              </label>
              <Select value={kategori} onChange={(v: string) => setKategori(v)}>
                <option value="all">Semua Kategori</option>
                <option value="event">Event / Kegiatan</option>
                <option value="mahasiswa">Data Mahasiswa</option>
                <option value="dokumen">Dokumen & SK</option>
                <option value="keuangan">Keuangan & LPJ</option>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearch("");
                  setKategori("all");
                }}
              >
                <i className="bi bi-arrow-counterclockwise mr-1.5" aria-hidden="true" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <DataTable
            columns={[
              {
                key: "kode",
                label: "Kode Arsip",
                render: (row) => (
                  <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono text-xs">
                    {row.kode}
                  </span>
                ),
              },
              {
                key: "judul",
                label: "Judul Entitas",
                render: (row) => (
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {row.judul}
                    </p>
                    <p className="text-xs text-slate-500">
                      Asal: {row.penyelenggaraAsal}
                    </p>
                  </div>
                ),
              },
              {
                key: "kategori",
                label: "Kategori",
                render: (row) => (
                  <Badge
                    variant={
                      row.kategori === "event"
                        ? "primary"
                        : row.kategori === "keuangan"
                        ? "warning"
                        : row.kategori === "dokumen"
                        ? "info"
                        : "secondary"
                    }
                  >
                    {row.kategori.toUpperCase()}
                  </Badge>
                ),
              },
              {
                key: "tahun",
                label: "Tahun",
                align: "center",
                render: (row) => row.tahun,
              },
              {
                key: "statusMigrasi",
                label: "Status Migrasi",
                render: (row) => (
                  <Badge
                    variant={
                      row.statusMigrasi === "migrated" ? "success" : "secondary"
                    }
                    dot
                  >
                    {row.statusMigrasi === "migrated"
                      ? "Terpetakan ke Multi-UKM"
                      : "Arsip Statis"}
                  </Badge>
                ),
              },
              {
                key: "tanggalArsip",
                label: "Tanggal Arsip",
                render: (row) => formatDateShort(row.tanggalArsip),
              },
            ]}
            data={filtered}
            rowActions={[
              {
                label: "Lihat Detail (Read-Only)",
                onClick: (row) => {
                  alert(
                    `Arsip "${row.judul}" (${row.kode})\nKategori: ${row.kategori}\nTahun: ${row.tahun}\nStatus: Read-Only (Terproteksi)`
                  );
                },
              },
            ]}
          />
        </div>
      </div>
    </AppShell>
  );
}
