// mocks/document.mock.ts — Data contoh domain Dokumen

import type { DocumentFolder, DocumentEntity, DocumentVersion } from "../types/document";

export const MOCK_DOCUMENT_FOLDERS: DocumentFolder[] = [
  { id: "fold-001", nama: "Surat", parentId: null, ukmId: "ukm-bem", createdAt: "2024-03-01T08:00:00" },
  { id: "fold-002", nama: "Laporan", parentId: null, ukmId: "ukm-bem", createdAt: "2024-03-01T08:00:00" },
  { id: "fold-003", nama: "Proker", parentId: null, ukmId: "ukm-bem", createdAt: "2024-03-01T08:00:00" },
  { id: "fold-004", nama: "Keuangan", parentId: null, ukmId: "ukm-bem", createdAt: "2024-03-01T08:00:00" },
  { id: "fold-005", nama: "Laporan Tahunan", parentId: "fold-002", ukmId: "ukm-bem", createdAt: "2024-03-01T09:00:00" },
];

export const MOCK_DOCUMENTS: DocumentEntity[] = [
  {
    id: "doc-001",
    judul: "Laporan Kegiatan Lomba KTI 2026",
    tipe: "laporan",
    fileUrl: "/uploads/documents/laporan-kti.pdf",
    ukuranFile: 2048576,
    versi: 1,
    folderId: "fold-002",
    ukmId: "ukm-bem",
    diunggahOleh: "Ahmad Fauzi",
    diunggahPada: "2026-10-15T10:00:00",
    deskripsi: "Laporan akhir lomba KTI tahun 2026",
  },
  {
    id: "doc-002",
    judul: "Surat Izin Kegiatan",
    tipe: "surat",
    fileUrl: "/uploads/documents/surat-izin.pdf",
    ukuranFile: 512000,
    versi: 1,
    folderId: "fold-001",
    ukmId: "ukm-bem",
    diunggahOleh: "Siti Rahmawati",
    diunggahPada: "2026-10-20T14:00:00",
    deskripsi: "Surat izin dari rektorat",
  },
  {
    id: "doc-003",
    judul: "Proker Tahunan 2026/2027",
    tipe: "proker",
    fileUrl: "/uploads/documents/proker-2026.pdf",
    ukuranFile: 1024000,
    versi: 2,
    folderId: "fold-003",
    ukmId: "ukm-bem",
    diunggahOleh: "Budi Santoso",
    diunggahPada: "2026-09-01T08:00:00",
    deskripsi: "Program kerja tahunan UKM",
  },
];

export const MOCK_DOCUMENT_VERSIONS: DocumentVersion[] = [
  {
    id: "ver-001",
    documentId: "doc-003",
    versi: 1,
    fileUrl: "/uploads/documents/proker-2026-v1.pdf",
    ukuranFile: 900000,
    diunggahOleh: "Budi Santoso",
    diunggahPada: "2026-08-01T08:00:00",
    catatan: "Versi awal",
  },
  {
    id: "ver-002",
    documentId: "doc-003",
    versi: 2,
    fileUrl: "/uploads/documents/proker-2026-v2.pdf",
    ukuranFile: 1024000,
    diunggahOleh: "Budi Santoso",
    diunggahPada: "2026-09-01T08:00:00",
    catatan: "Revisi anggaran",
  },
];