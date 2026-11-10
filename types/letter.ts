// types/letter.ts — Tipe domain Surat-Menyurat (FE-4)

import type { BaseQuery } from "./common";

export type LetterType = "surat_masuk" | "surat_keluar";
export type LetterStatus = "draft" | "diajujkan" | "disetujui" | "ditolak" | "diarcis";
export type LetterPriority = "rendah" | "normal" | "tinggi" | "urgent";

export interface LetterTemplate {
  id: string;
  nama: string;
  kode: string;
  formatNomor: string;
  isActive: boolean;
}

export interface LetterEntity {
  id: string;
  nomorSurat: string;
  jenis: LetterType;
  status: LetterStatus;
  prioritas: LetterPriority;
  perihal: string;
  tujuan?: string;
  pengirim?: string;
  tanggalSurat: string;
  tanggalTerima?: string;
  fileUrl?: string;
  ukmId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LetterQuery extends BaseQuery {
  jenis?: LetterType | "all";
  status?: LetterStatus | "all";
  prioritas?: LetterPriority | "all";
  search?: string;
}

export interface LetterCreatePayload {
  jenis: LetterType;
  prioritas?: LetterPriority;
  perihal: string;
  tujuan?: string;
  pengirim?: string;
  tanggalSurat: string;
  fileUrl?: string;
}

export interface LetterStatusPayload {
  status: LetterStatus;
  catatan?: string;
}

export interface LetterService {
  list(params?: LetterQuery): Promise<{ data: LetterEntity[]; total: number }>;
  detail(id: string): Promise<LetterEntity>;
  create(payload: LetterCreatePayload): Promise<LetterEntity>;
  updateStatus(id: string, payload: LetterStatusPayload): Promise<LetterEntity>;
  delete(id: string): Promise<void>;
  listTemplates(): Promise<LetterTemplate[]>;
  generateNomorSurat(jenis: LetterType): Promise<string>;
}