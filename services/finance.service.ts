// services/finance.service.ts — Kontrak & adapter Keuangan (FE-5)

import type {
  FinanceTransaction,
  FinanceQuery,
  FinanceCreatePayload,
  FinanceApprovalPayload,
  FinanceSummary,
  FinanceService,
} from "../types/finance";
import api from "../lib/api";
import { isMockEnabled } from "../lib/env";
import { buildSimplePdfBlob, buildCsvBlob } from "../lib/pdf";
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

interface BackendFinanceRow {
  id: number | string;
  organizer_id?: number | string;
  nomor_transaksi?: string;
  jenis: string;
  kategori?: string;
  status?: string;
  nominal: number | string;
  deskripsi?: string;
  tanggal_transaksi?: string;
  bukti_file?: string | null;
  catatan?: string | null;
  created_at?: string;
  updated_at?: string;
}

function mapFinanceRow(r: BackendFinanceRow): FinanceTransaction {
  const now = new Date().toISOString();
  const status: FinanceTransaction["status"] =
    r.status === "diajukan" ||
    r.status === "disetujui" ||
    r.status === "ditolak" ||
    r.status === "dicairkan" ||
    r.status === "dibatalkan"
      ? r.status
      : "diajukan";
  const kategori: FinanceTransaction["kategori"] =
    r.kategori === "operasional" ||
    r.kategori === "kegiatan" ||
    r.kategori === "kepentingan" ||
    r.kategori === "lainnya"
      ? r.kategori
      : "operasional";
  return {
    id: String(r.id),
    nomorTransaksi: r.nomor_transaksi || `TRX-${r.id}`,
    jenis: r.jenis === "pemasukan" ? "pemasukan" : "pengeluaran",
    kategori,
    status,
    nominal: Number(r.nominal) || 0,
    deskripsi: r.deskripsi || "",
    tanggalTransaksi: r.tanggal_transaksi || now,
    buktiFile: r.bukti_file ?? null,
    ukmId: r.organizer_id ? String(r.organizer_id) : "ukm-default",
    createdBy: "Organizer",
    catatan: r.catatan ?? null,
    createdAt: r.created_at || now,
    updatedAt: r.updated_at || r.created_at || now,
  };
}

class FinanceRealService implements FinanceService {
  async list(params?: FinanceQuery): Promise<{ data: FinanceTransaction[]; total: number }> {
    const res = await api.get<{ data: BackendFinanceRow[] }>("/organizer/finance");
    let mapped = (res.data?.data ?? []).map(mapFinanceRow);
    if (params?.search) {
      const q = params.search.toLowerCase();
      mapped = mapped.filter(
        (t) => t.deskripsi.toLowerCase().includes(q) || t.nomorTransaksi.toLowerCase().includes(q)
      );
    }
    if (params?.jenis && params.jenis !== "all") mapped = mapped.filter((t) => t.jenis === params.jenis);
    if (params?.status && params.status !== "all") mapped = mapped.filter((t) => t.status === params.status);
    if (params?.kategori && params.kategori !== "all") mapped = mapped.filter((t) => t.kategori === params.kategori);
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;
    return { data: mapped.slice(start, start + limit), total: mapped.length };
  }

  async detail(id: string): Promise<FinanceTransaction> {
    const { data } = await this.list({ limit: 200 });
    const found = data.find((t) => t.id === id);
    if (!found) throw new Error(`Transaksi #${id} tidak ditemukan`);
    return found;
  }

  async create(payload: FinanceCreatePayload): Promise<FinanceTransaction> {
    const res = await api.post<{ id: number | string; nomor_transaksi?: string }>("/organizer/finance", {
      jenis: payload.jenis,
      kategori: payload.kategori,
      nominal: payload.nominal,
      deskripsi: payload.deskripsi,
      tanggal_transaksi: payload.tanggalTransaksi,
      bukti_file: payload.buktiFile ?? null,
    });
    const now = new Date().toISOString();
    return {
      id: String(res.data?.id ?? Date.now()),
      nomorTransaksi: res.data?.nomor_transaksi || `TRX-${Date.now()}`,
      jenis: payload.jenis,
      kategori: payload.kategori,
      status: "diajukan",
      nominal: payload.nominal,
      deskripsi: payload.deskripsi,
      tanggalTransaksi: payload.tanggalTransaksi,
      buktiFile: payload.buktiFile ?? null,
      ukmId: "ukm-default",
      kegiatanId: payload.kegiatanId ?? null,
      createdBy: "Organizer",
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateStatus(id: string, payload: FinanceApprovalPayload): Promise<FinanceTransaction> {
    await api.patch(`/organizer/finance/${id}/status`, {
      status: payload.status,
      catatan: payload.catatan ?? null,
    });
    return this.detail(id);
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/organizer/finance/${id}`);
  }

  async summary(): Promise<FinanceSummary> {
    const { data } = await this.list({ limit: 500 });
    const totalPemasukan = data
      .filter((t) => t.jenis === "pemasukan" && t.status !== "ditolak" && t.status !== "dibatalkan")
      .reduce((sum, t) => sum + t.nominal, 0);
    const totalPengeluaran = data
      .filter((t) => t.jenis === "pengeluaran" && t.status !== "ditolak" && t.status !== "dibatalkan")
      .reduce((sum, t) => sum + t.nominal, 0);
    return {
      totalPemasukan,
      totalPengeluaran,
      saldo: totalPemasukan - totalPengeluaran,
      totalTransaksi: data.length,
    };
  }

  async exportPdf(): Promise<Blob> {
    const [{ data }, summary] = await Promise.all([
      this.list({ limit: 100 }),
      this.summary(),
    ]);
    const lines = [
      `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`,
      `Total Pemasukan : Rp ${summary.totalPemasukan.toLocaleString("id-ID")}`,
      `Total Pengeluaran: Rp ${summary.totalPengeluaran.toLocaleString("id-ID")}`,
      `Saldo Akhir     : Rp ${summary.saldo.toLocaleString("id-ID")}`,
      "---------------------------------------------------------------------",
      ...data.map(
        (t, i) =>
          `${i + 1}. [${t.tanggalTransaksi.slice(0, 10)}] ${t.jenis.toUpperCase()} - Rp ${t.nominal.toLocaleString("id-ID")} (${t.status}) | ${t.deskripsi}`
      ),
    ];
    return buildSimplePdfBlob("Laporan Keuangan UKM", lines);
  }

  async exportExcel(): Promise<Blob> {
    const { data } = await this.list({ limit: 500 });
    return buildCsvBlob(
      ["Nomor", "Tanggal", "Jenis", "Kategori", "Nominal", "Status", "Deskripsi"],
      data.map((t) => [
        t.nomorTransaksi,
        t.tanggalTransaksi.slice(0, 10),
        t.jenis,
        t.kategori,
        t.nominal,
        t.status,
        t.deskripsi,
      ])
    );
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