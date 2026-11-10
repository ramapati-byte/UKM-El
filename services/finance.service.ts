// services/finance.service.ts — Kontrak & adapter Keuangan (FE-5)

import type {
  FinanceTransaction,
  FinanceQuery,
  FinanceCreatePayload,
  FinanceApprovalPayload,
  FinanceSummary,
  FinanceService,
} from "../types/finance";
import { isMockEnabled } from "../lib/env";
import { MOCK_FINANCE_TRANSACTIONS, MOCK_FINANCE_SUMMARY } from "../mocks/finance.mock";

class FinanceMockService implements FinanceService {
  private transactions = [...MOCK_FINANCE_TRANSACTIONS];
  private counter = this.transactions.length;

  async list(params?: FinanceQuery): Promise<{ data: FinanceTransaction[]; total: number }> {
    let result = [...this.transactions];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter((t) => t.deskripsi.toLowerCase().includes(q) || t.nomorTransaksi.toLowerCase().includes(q));
    }
    if (params?.jenis && params.jenis !== "all") result = result.filter((t) => t.jenis === params.jenis);
    if (params?.status && params.status !== "all") result = result.filter((t) => t.status === params.status);
    if (params?.kategori && params.kategori !== "all") result = result.filter((t) => t.kategori === params.kategori);
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;
    return { data: result.slice(start, start + limit), total: result.length };
  }

  async detail(id: string): Promise<FinanceTransaction> {
    const t = this.transactions.find((x) => x.id === id);
    if (!t) throw new Error("Transaksi tidak ditemukan");
    return { ...t };
  }

  async create(payload: FinanceCreatePayload): Promise<FinanceTransaction> {
    const now = new Date();
    const tahun = now.getFullYear();
    const bulan = String(now.getMonth() + 1).padStart(2, "0");
    const nomorTransaksi = `FIN/${tahun}/${bulan}/${String(++this.counter).padStart(3, "0")}`;
    const transaction: FinanceTransaction = {
      id: `fin-${Date.now()}`,
      nomorTransaksi,
      jenis: payload.jenis,
      kategori: payload.kategori,
      status: "diajukan",
      nominal: payload.nominal,
      deskripsi: payload.deskripsi,
      tanggalTransaksi: payload.tanggalTransaksi,
      buktiFile: payload.buktiFile,
      ukmId: "ukm-bem",
      kegiatanId: payload.kegiatanId,
      createdBy: "user-001",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.transactions.push(transaction);
    return transaction;
  }

  async updateStatus(id: string, payload: FinanceApprovalPayload): Promise<FinanceTransaction> {
    const idx = this.transactions.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Transaksi tidak ditemukan");
    this.transactions[idx].status = payload.status;
    this.transactions[idx].approvedBy = "user-002";
    this.transactions[idx].approvedAt = new Date().toISOString();
    this.transactions[idx].catatan = payload.catatan;
    this.transactions[idx].updatedAt = new Date().toISOString();
    return { ...this.transactions[idx] };
  }

  async delete(id: string): Promise<void> {
    const idx = this.transactions.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Transaksi tidak ditemukan");
    this.transactions.splice(idx, 1);
  }

  async summary(_tanggalAwal?: string, _tanggalAkhir?: string): Promise<FinanceSummary> {
    return { ...MOCK_FINANCE_SUMMARY };
  }

  async exportPdf(): Promise<Blob> {
    return new Blob(["PDF content"], { type: "application/pdf" });
  }

  async exportExcel(): Promise<Blob> {
    return new Blob(["Excel content"], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }
}

class FinanceRealService implements FinanceService {
  async list(): Promise<{ data: FinanceTransaction[]; total: number }> {
    throw new Error("Real adapter belum tersedia");
  }
  async detail(): Promise<FinanceTransaction> {
    throw new Error("Real adapter belum tersedia");
  }
  async create(): Promise<FinanceTransaction> {
    throw new Error("Real adapter belum tersedia");
  }
  async updateStatus(): Promise<FinanceTransaction> {
    throw new Error("Real adapter belum tersedia");
  }
  async delete(): Promise<void> {
    throw new Error("Real adapter belum tersedia");
  }
  async summary(): Promise<FinanceSummary> {
    throw new Error("Real adapter belum tersedia");
  }
  async exportPdf(): Promise<Blob> {
    throw new Error("Real adapter belum tersedia");
  }
  async exportExcel(): Promise<Blob> {
    throw new Error("Real adapter belum tersedia");
  }
}

const mockAdapter = new FinanceMockService();
const realAdapter = new FinanceRealService();

export const financeService: FinanceService = new Proxy({} as FinanceService, {
  get(_target, prop: keyof FinanceService) {
    const adapter = isMockEnabled() ? mockAdapter : realAdapter;
    const value = adapter[prop];
    if (typeof value === "function") return value.bind(adapter);
    return value;
  },
});