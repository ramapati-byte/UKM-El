// types/inventory.ts — Tipe domain Inventaris & Peminjaman (FE-6)

import type { BaseQuery } from "./common";

export type InventoryCategory = "barang" | "ruang";
export type InventoryCondition = "baru" | "baik" | "rusak_ringan" | "rusak_berat" | "hilang";
export type LoanStatus = "diajukan" | "disetujui" | "ditolak" | "dikembalikan" | "terlambat";

export interface InventoryItem {
  id: string;
  kode: string;
  nama: string;
  kategori: InventoryCategory;
  kondisi: InventoryCondition;
  stok: number;
  lokasi?: string;
  gambarUrl?: string;
  keterangan?: string;
  ukmId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryQuery extends BaseQuery {
  kategori?: InventoryCategory | "all";
  kondisi?: InventoryCondition | "all";
  search?: string;
}

export interface InventoryLoan {
  id: string;
  nomorPinjam: string;
  itemId: string;
  itemNama: string;
  jumlah: number;
  tanggalPinjam: string;
  tanggalKembaliRencana: string;
  tanggalKembaliRealisasi?: string;
  status: LoanStatus;
  kondisiCheckout?: InventoryCondition;
  kondisiCheckin?: InventoryCondition;
  catatanCheckout?: string;
  catatanCheckin?: string;
  dipinjamOleh: string;
  disetujuiOleh?: string;
  ukmId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanQuery extends BaseQuery {
  status?: LoanStatus | "all";
  search?: string;
}

export interface InventoryCreatePayload {
  kode: string;
  nama: string;
  kategori: InventoryCategory;
  stok: number;
  lokasi?: string;
  gambarUrl?: string;
  keterangan?: string;
}

export interface LoanCreatePayload {
  itemId: string;
  jumlah: number;
  tanggalPinjam: string;
  tanggalKembaliRencana: string;
  catatanCheckout?: string;
}

export interface LoanApprovalPayload {
  status: "disetujui" | "ditolak";
  catatan?: string;
}

export interface InventoryService {
  list(params?: InventoryQuery): Promise<{ data: InventoryItem[]; total: number }>;
  detail(id: string): Promise<InventoryItem>;
  create(payload: InventoryCreatePayload): Promise<InventoryItem>;
  update(id: string, payload: Partial<InventoryCreatePayload>): Promise<InventoryItem>;
  delete(id: string): Promise<void>;
  listLoans(params?: LoanQuery): Promise<{ data: InventoryLoan[]; total: number }>;
  createLoan(payload: LoanCreatePayload): Promise<InventoryLoan>;
  approveLoan(id: string, payload: LoanApprovalPayload): Promise<InventoryLoan>;
  returnLoan(id: string, kondisi: InventoryCondition, catatan?: string): Promise<InventoryLoan>;
  checkAvailability(itemId: string, tanggalAwal: string, tanggalAkhir: string): Promise<boolean>;
}