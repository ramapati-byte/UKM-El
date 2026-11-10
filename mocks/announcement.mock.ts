// mocks/announcement.mock.ts — Data contoh domain Pengumuman & Notifikasi

import type { AnnouncementEntity, NotificationEntity } from "../types/announcement";

export const MOCK_ANNOUNCEMENTS: AnnouncementEntity[] = [
  {
    id: "ann-001",
    judul: "Pembuka Pendaftaran Anggota UKM Baru",
    isi: "Pendaftaran anggota UKM baru untuk periode 2026/2027 telah dibuka. Silakan daftar melalui halaman recruitment.",
    audience: "semua",
    ukmId: null,
    tanggalMulai: "2026-11-01",
    tanggalBerakhir: "2026-11-15",
    isActive: true,
    dibuatOleh: "admin",
    dibuatPada: "2026-11-01T08:00:00",
    updatedAt: "2026-11-01T08:00:00",
  },
  {
    id: "ann-002",
    judul: "Rapat Koordinasi Bulanan UKM",
    isi: "Rapat koordinasi bulanan akan digelar pada Jumat, 6 November 2026 pukul 10.00 WIB di Ruang Rapat UKM.",
    audience: "ukm",
    ukmId: "ukm-bem",
    tanggalMulai: "2026-11-03",
    tanggalBerakhir: "2026-11-06",
    isActive: true,
    dibuatOleh: "sekretaris",
    dibuatPada: "2026-11-03T09:00:00",
    updatedAt: "2026-11-03T09:00:00",
  },
  {
    id: "ann-003",
    judul: "Pengumuman Libur Nasional",
    isi: "Kantor UKM tutup pada tanggal 1-2 November 2026 ke atas hari libur nasional.",
    audience: "semua",
    ukmId: null,
    tanggalMulai: "2026-10-28",
    tanggalBerakhir: "2026-11-02",
    isActive: true,
    dibuatOleh: "admin",
    dibuatPada: "2026-10-28T10:00:00",
    updatedAt: "2026-10-28T10:00:00",
  },
];

export const MOCK_NOTIFICATIONS: NotificationEntity[] = [
  {
    id: "notif-001",
    judul: "Pengajuan Surat Disetujui",
    pesan: "Surat Izin Kegiatan Anda telah disetujui oleh manajemen.",
    tipe: "success",
    dibaca: false,
    url: "/organizer/letters/ltr-001",
    ukmId: "ukm-bem",
    dibuatPada: "2026-11-02T10:00:00",
  },
  {
    id: "notif-002",
    judul: "Pengingat Rapat Koordinasi",
    pesan: "Jangan lupa rapat koordinasi besok pagi pukul 10.00 WIB.",
    tipe: "info",
    dibaca: false,
    url: "/organizer/dashboard",
    ukmId: "ukm-bem",
    dibuatPada: "2026-11-04T14:00:00",
  },
  {
    id: "notif-003",
    judul: "Peminjaman Barang Ditolak",
    pesan: "Pengajuan peminjaman Sound System ditolak karena kondisi barang kurang layak pakai.",
    tipe: "warning",
    dibaca: true,
    url: "/organizer/inventory/loans",
    ukmId: "ukm-bem",
    dibuatPada: "2026-11-01T09:00:00",
  },
];

export const MOCK_DASHBOARD_STATS = {
  totalAnggota: 45,
  totalKegiatan: 12,
  totalAnggaran: 5250000,
  tugasTertunda: 3,
  ukmId: "ukm-bem",
};