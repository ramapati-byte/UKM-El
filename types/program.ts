// types/program.ts — Tipe domain Proker & Evaluasi (FE-7)

import type { BaseQuery } from "./common";

export type ProgramStatus = "draft" | "aktif" | "selesai" | "dibatalkan";

export interface ProgramEntity {
  id: string;
  nama: string;
  deskripsi?: string;
  periode: string;
  target: number;
  realisasi: number;
  satuan: string;
  status: ProgramStatus;
  ukmId: string;
  divisi?: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramQuery extends BaseQuery {
  status?: ProgramStatus | "all";
  periode?: string;
  divisi?: string;
  search?: string;
}

export interface ProgramProgress {
  programId: string;
  progresPersen: number;
  catatan?: string;
  tanggalUpdate: string;
}

export interface RankingEntry {
  ukmId: string;
  ukmNama: string;
  ukmSlug: string;
  ukmLogo?: string;
  skor: number;
  peringkat: number;
  totalKegiatan: number;
  totalAnggota: number;
  periode: string;
}

export interface RankingQuery extends BaseQuery {
  periode?: string;
}

export interface ProgramService {
  list(params?: ProgramQuery): Promise<{ data: ProgramEntity[]; total: number }>;
  detail(id: string): Promise<ProgramEntity>;
  create(payload: Omit<ProgramEntity, "id" | "createdAt" | "updatedAt">): Promise<ProgramEntity>;
  update(id: string, payload: Partial<ProgramEntity>): Promise<ProgramEntity>;
  delete(id: string): Promise<void>;
  updateProgress(id: string, progres: number, catatan?: string): Promise<ProgramEntity>;
  ranking(params?: RankingQuery): Promise<RankingEntry[]>;
}