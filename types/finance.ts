// types/finance.ts — Tipe domain Keuangan UKM (FE-5)

import type { BaseQuery } from "./common";

export type FinanceType = "pemasukan" | "pengeluaran";
export type FinanceStatus = "diajukan" | "disetujui" | "ditolak" | "dicairkan" | "dibatalkan";
export type FinanceCategory = "operasional" | "kegiatan" | "kepentingan" | "lainnya";

export interface FinanceTransaction {
  id: string;
  nomorTransaksi: string;
  jenis: FinanceType;
  kategori: FinanceCategory;
  status: FinanceStatus;
  nominal: number;
  deskripsi: string;
  tanggalTransaksi: string;
  buktiFile?: string;
  ukmId: string;
  kegiatanId?: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  catatan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceQuery extends BaseQuery {
  jenis?: FinanceType | "all";
  status?: FinanceStatus | "all";
  kategori?: FinanceCategory | "all";
  search?: string;
  tanggalAwal?: string;
  tanggalAkhir?: string;
}

export interface FinanceCreatePayload {
  jenis: FinanceType;
  kategori: FinanceCategory;
  nominal: number;
  deskripsi: string;
  tanggalTransaksi: string;
  buktiFile?: string;
  kegiatanId?: string;
}

export interface FinanceApprovalPayload {
  status: "disetujui" | "ditolak";
  catatan?: string;
}

export interface FinanceSummary {
  totalPemasukan: number;
  totalPengeluaran: number;
  saldo: number;
  totalTransaksi: number;
}

export interface FinanceService {
  list(params?: FinanceQuery): Promise<{ data: FinanceTransaction[]; total: number }>;
  detail(id: string): Promise<FinanceTransaction>;
  create(payload: FinanceCreatePayload): Promise<FinanceTransaction>;
  updateStatus(id: string, payload: FinanceApprovalPayload): Promise<FinanceTransaction>;
  delete(id: string): Promise<void>;
  summary(tanggalAwal?: string, tanggalAkhir?: string): Promise<FinanceSummary>;
  exportPdf(): Promise<Blob>;
  exportExcel(): Promise<Blob>;
}