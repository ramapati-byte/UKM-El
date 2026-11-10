// mocks/dashboard.mock.ts — Data contoh domain Dasbor

import type { DashboardStats, TaskItem, WidgetData } from "../types/dashboard";

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalAnggota: 45,
  totalKegiatan: 12,
  totalAnggaran: 5250000,
  tugasTertunda: 3,
  ukmId: "ukm-bem",
};

export const MOCK_DASHBOARD_TASKS: TaskItem[] = [
  {
    id: "task-001",
    judul: "Review proposal kegiatan",
    deadline: "2026-11-05",
    status: "proses",
    prioritas: "tinggi",
  },
  {
    id: "task-002",
    judul: "Persiapan surat ke rektorat",
    deadline: "2026-11-07",
    status: "belum",
    prioritas: "normal",
  },
  {
    id: "task-003",
    judul: "Verifikasi anggota baru",
    deadline: "2026-11-08",
    status: "belum",
    prioritas: "rendah",
  },
];

export const MOCK_WIDGET_DATA: WidgetData[] = [
  { label: "Anggota Aktif", value: 40, trend: 5, trendLabel: "dari bulan lalu" },
  { label: "Kegiatan Selesai", value: 8, trend: -2, trendLabel: "dari bulan lalu" },
  { label: "Saldo Kas", value: "Rp 5.250.000", trend: 10, trendLabel: "dari bulan lalu" },
  { label: "Tugas Tertunda", value: 3, trend: 0, trendLabel: "dari bulan lalu" },
];