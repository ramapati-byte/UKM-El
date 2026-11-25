// services/inventory.service.ts — Kontrak & adapter Inventaris (FE-6)

import type {
  InventoryItem,
  InventoryQuery,
  InventoryCreatePayload,
  InventoryLoan,
  LoanQuery,
  LoanCreatePayload,
  LoanApprovalPayload,
  InventoryService,
  InventoryCondition,
} from "../types/inventory";
import api from "../lib/api";
import { isMockEnabled } from "../lib/env";
import { MOCK_INVENTORY_ITEMS, MOCK_INVENTORY_LOANS } from "../mocks/inventory.mock";

class InventoryMockService implements InventoryService {
  private items = [...MOCK_INVENTORY_ITEMS];
  private loans = [...MOCK_INVENTORY_LOANS];
  private itemCounter = this.items.length;
  private loanCounter = this.loans.length;

  async list(params?: InventoryQuery): Promise<{ data: InventoryItem[]; total: number }> {
    let result = [...this.items];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter((i) => i.nama.toLowerCase().includes(q) || i.kode.toLowerCase().includes(q));
    }
    if (params?.kategori && params.kategori !== "all") result = result.filter((i) => i.kategori === params.kategori);
    if (params?.kondisi && params.kondisi !== "all") result = result.filter((i) => i.kondisi === params.kondisi);
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;
    return { data: result.slice(start, start + limit), total: result.length };
  }

  async detail(id: string): Promise<InventoryItem> {
    const i = this.items.find((x) => x.id === id);
    if (!i) throw new Error("Item tidak ditemukan");
    return { ...i };
  }

  async create(payload: InventoryCreatePayload): Promise<InventoryItem> {
    const id = `inv-${Date.now()}`;
    const item: InventoryItem = {
      id,
      kode: payload.kode,
      nama: payload.nama,
      kategori: payload.kategori,
      kondisi: "baru",
      stok: payload.stok,
      lokasi: payload.lokasi,
      gambarUrl: payload.gambarUrl,
      keterangan: payload.keterangan,
      ukmId: "ukm-bem",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.items.push(item);
    this.itemCounter++;
    return item;
  }

  async update(id: string, payload: Partial<InventoryCreatePayload>): Promise<InventoryItem> {
    const idx = this.items.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error("Item tidak ditemukan");
    this.items[idx] = { ...this.items[idx], ...payload, updatedAt: new Date().toISOString() };
    return { ...this.items[idx] };
  }

  async delete(id: string): Promise<void> {
    const idx = this.items.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error("Item tidak ditemukan");
    this.items.splice(idx, 1);
  }

  async listLoans(params?: LoanQuery): Promise<{ data: InventoryLoan[]; total: number }> {
    let result = [...this.loans];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter((l) => l.itemNama.toLowerCase().includes(q) || l.dipinjamOleh.toLowerCase().includes(q));
    }
    if (params?.status && params.status !== "all") result = result.filter((l) => l.status === params.status);
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;
    return { data: result.slice(start, start + limit), total: result.length };
  }

  async createLoan(payload: LoanCreatePayload): Promise<InventoryLoan> {
    const now = new Date();
    const tahun = now.getFullYear();
    const bulan = String(now.getMonth() + 1).padStart(2, "0");
    const nomorPinjam = `PJM/${tahun}/${bulan}/${String(++this.loanCounter).padStart(3, "0")}`;
    const item = this.items.find((i) => i.id === payload.itemId);
    const loan: InventoryLoan = {
      id: `loan-${Date.now()}`,
      nomorPinjam,
      itemId: payload.itemId,
      itemNama: item?.nama ?? "Item",
      jumlah: payload.jumlah,
      tanggalPinjam: payload.tanggalPinjam,
      tanggalKembaliRencana: payload.tanggalKembaliRencana,
      status: "diajukan",
      dipinjamOleh: "user-001",
      ukmId: "ukm-bem",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.loans.push(loan);
    return loan;
  }

  async approveLoan(id: string, payload: LoanApprovalPayload): Promise<InventoryLoan> {
    const idx = this.loans.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error("Pinjaman tidak ditemukan");
    this.loans[idx].status = payload.status;
    this.loans[idx].disetujuiOleh = "user-002";
    this.loans[idx].updatedAt = new Date().toISOString();
    return { ...this.loans[idx] };
  }

  async returnLoan(id: string, kondisi: InventoryCondition, catatan?: string): Promise<InventoryLoan> {
    const idx = this.loans.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error("Pinjaman tidak ditemukan");
    this.loans[idx].status = "dikembalikan";
    this.loans[idx].kondisiCheckin = kondisi;
    this.loans[idx].catatanCheckin = catatan;
    this.loans[idx].tanggalKembaliRealisasi = new Date().toISOString();
    this.loans[idx].updatedAt = new Date().toISOString();
    return { ...this.loans[idx] };
  }

  async checkAvailability(itemId: string, _tanggalAwal: string, _tanggalAkhir: string): Promise<boolean> {
    const conflicting = this.loans.some(
      (l) => l.itemId === itemId && l.status !== "dikembalikan" && l.status !== "ditolak"
    );
    return !conflicting;
  }
}

interface BackendInventoryRow {
  id: number | string;
  organizer_id?: number | string;
  nama_barang: string;
  kode_barang?: string | null;
  kategori?: string | null;
  jumlah_total?: number | null;
  jumlah_tersedia?: number | null;
  kondisi?: string | null;
  lokasi_simpan?: string | null;
  catatan?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface BackendLoanRow {
  id: number | string;
  item_id: number | string;
  nama_barang?: string;
  nama_peminjam: string;
  jumlah?: number | null;
  tanggal_pinjam?: string;
  tanggal_kembali_rencana?: string;
  tanggal_kembali_aktual?: string | null;
  keperluan?: string | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
}

function mapInventoryCondition(raw?: string | null): InventoryCondition {
  if (raw === "baru" || raw === "baik" || raw === "rusak_ringan" || raw === "rusak_berat" || raw === "hilang") {
    return raw;
  }
  return "baik";
}

function mapInventoryRow(r: BackendInventoryRow): InventoryItem {
  const now = new Date().toISOString();
  return {
    id: String(r.id),
    kode: r.kode_barang || `INV-${r.id}`,
    nama: r.nama_barang,
    kategori: r.kategori === "ruang" ? "ruang" : "barang",
    kondisi: mapInventoryCondition(r.kondisi),
    stok: r.jumlah_tersedia ?? r.jumlah_total ?? 0,
    lokasi: r.lokasi_simpan || null,
    keterangan: r.catatan || null,
    ukmId: r.organizer_id ? String(r.organizer_id) : "ukm-default",
    createdAt: r.created_at || now,
    updatedAt: r.updated_at || r.created_at || now,
  };
}

function mapLoanStatus(raw?: string | null): InventoryLoan["status"] {
  if (raw === "diajukan" || raw === "disetujui" || raw === "ditolak" || raw === "dikembalikan" || raw === "terlambat") {
    return raw;
  }
  if (raw === "dipinjam") return "disetujui";
  return "diajukan";
}

function mapLoanRow(r: BackendLoanRow): InventoryLoan {
  const now = new Date().toISOString();
  return {
    id: String(r.id),
    nomorPinjam: `PJM-${r.id}`,
    itemId: String(r.item_id),
    itemNama: r.nama_barang || `Item #${r.item_id}`,
    jumlah: r.jumlah ?? 1,
    tanggalPinjam: r.tanggal_pinjam || now,
    tanggalKembaliRencana: r.tanggal_kembali_rencana || now,
    tanggalKembaliRealisasi: r.tanggal_kembali_aktual || null,
    status: mapLoanStatus(r.status),
    catatanCheckout: r.keperluan || null,
    dipinjamOleh: r.nama_peminjam,
    ukmId: "ukm-default",
    createdAt: r.created_at || now,
    updatedAt: r.updated_at || r.created_at || now,
  };
}

class InventoryRealService implements InventoryService {
  async list(params?: InventoryQuery): Promise<{ data: InventoryItem[]; total: number }> {
    const res = await api.get<{ data: BackendInventoryRow[] }>("/organizer/inventory");
    let mapped = (res.data?.data ?? []).map(mapInventoryRow);
    if (params?.search) {
      const q = params.search.toLowerCase();
      mapped = mapped.filter(
        (i) => i.nama.toLowerCase().includes(q) || i.kode.toLowerCase().includes(q)
      );
    }
    if (params?.kategori && params.kategori !== "all") {
      mapped = mapped.filter((i) => i.kategori === params.kategori);
    }
    if (params?.kondisi && params.kondisi !== "all") {
      mapped = mapped.filter((i) => i.kondisi === params.kondisi);
    }
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;
    return { data: mapped.slice(start, start + limit), total: mapped.length };
  }

  async detail(id: string): Promise<InventoryItem> {
    const { data } = await this.list({ limit: 200 });
    const found = data.find((i) => i.id === id);
    if (!found) throw new Error("Item inventaris tidak ditemukan");
    return found;
  }

  async create(payload: InventoryCreatePayload): Promise<InventoryItem> {
    const res = await api.post<{ id: number | string }>("/organizer/inventory", {
      nama_barang: payload.nama,
      kode_barang: payload.kode,
      kategori: payload.kategori,
      jumlah_total: payload.stok,
      kondisi: "baik",
      lokasi_simpan: payload.lokasi || null,
      catatan: payload.keterangan || null,
    });
    const now = new Date().toISOString();
    return {
      id: String(res.data?.id ?? Date.now()),
      kode: payload.kode,
      nama: payload.nama,
      kategori: payload.kategori,
      kondisi: "baik",
      stok: payload.stok,
      lokasi: payload.lokasi || null,
      gambarUrl: payload.gambarUrl || null,
      keterangan: payload.keterangan || null,
      ukmId: "ukm-default",
      createdAt: now,
      updatedAt: now,
    };
  }

  async update(id: string, payload: Partial<InventoryCreatePayload>): Promise<InventoryItem> {
    const current = await this.detail(id);
    await api.put(`/organizer/inventory/${id}`, {
      nama_barang: payload.nama ?? current.nama,
      kode_barang: payload.kode ?? current.kode,
      kategori: payload.kategori ?? current.kategori,
      jumlah_total: payload.stok ?? current.stok,
      jumlah_tersedia: payload.stok ?? current.stok,
      kondisi: current.kondisi,
      lokasi_simpan: payload.lokasi ?? current.lokasi ?? null,
      catatan: payload.keterangan ?? current.keterangan ?? null,
    });
    return { ...current, ...payload, updatedAt: new Date().toISOString() };
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/organizer/inventory/${id}`);
  }

  async listLoans(params?: LoanQuery): Promise<{ data: InventoryLoan[]; total: number }> {
    const res = await api.get<{ data: BackendLoanRow[] }>("/organizer/inventory/loans");
    let mapped = (res.data?.data ?? []).map(mapLoanRow);
    if (params?.status && params.status !== "all") {
      mapped = mapped.filter((l) => l.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      mapped = mapped.filter(
        (l) => l.itemNama.toLowerCase().includes(q) || l.dipinjamOleh.toLowerCase().includes(q)
      );
    }
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;
    return { data: mapped.slice(start, start + limit), total: mapped.length };
  }

  async createLoan(payload: LoanCreatePayload): Promise<InventoryLoan> {
    const res = await api.post<{ id: number | string }>("/organizer/inventory/loans", {
      item_id: Number(payload.itemId),
      nama_peminjam: "Anggota UKM",
      jumlah: payload.jumlah,
      tanggal_pinjam: payload.tanggalPinjam,
      tanggal_kembali_rencana: payload.tanggalKembaliRencana,
      keperluan: payload.catatanCheckout || null,
    });
    const now = new Date().toISOString();
    return {
      id: String(res.data?.id ?? Date.now()),
      nomorPinjam: `PJM-${res.data?.id ?? Date.now()}`,
      itemId: payload.itemId,
      itemNama: `Item #${payload.itemId}`,
      jumlah: payload.jumlah,
      tanggalPinjam: payload.tanggalPinjam,
      tanggalKembaliRencana: payload.tanggalKembaliRencana,
      status: "disetujui",
      catatanCheckout: payload.catatanCheckout || null,
      dipinjamOleh: "Anggota UKM",
      ukmId: "ukm-default",
      createdAt: now,
      updatedAt: now,
    };
  }

  async approveLoan(id: string, payload: LoanApprovalPayload): Promise<InventoryLoan> {
    const { data } = await this.listLoans({ limit: 200 });
    const found = data.find((l) => l.id === id);
    if (!found) throw new Error("Data peminjaman tidak ditemukan");
    return { ...found, status: payload.status, updatedAt: new Date().toISOString() };
  }

  async returnLoan(id: string, kondisi: InventoryCondition, catatan?: string): Promise<InventoryLoan> {
    await api.patch(`/organizer/inventory/loans/${id}/return`, { kondisi, catatan });
    const { data } = await this.listLoans({ limit: 200 });
    const found = data.find((l) => l.id === id);
    return (
      found || {
        id,
        nomorPinjam: `PJM-${id}`,
        itemId: "",
        itemNama: "",
        jumlah: 1,
        tanggalPinjam: new Date().toISOString(),
        tanggalKembaliRencana: new Date().toISOString(),
        tanggalKembaliRealisasi: new Date().toISOString(),
        status: "dikembalikan",
        kondisiCheckin: kondisi,
        catatanCheckin: catatan || null,
        dipinjamOleh: "",
        ukmId: "ukm-default",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
  }

  async checkAvailability(itemId: string): Promise<boolean> {
    const item = await this.detail(itemId);
    return item.stok > 0;
  }
}

const mockAdapter = new InventoryMockService();
const realAdapter = new InventoryRealService();

export const inventoryService: InventoryService = new Proxy({} as InventoryService, {
  get(_target, prop: keyof InventoryService) {
    const adapter = isMockEnabled() ? mockAdapter : realAdapter;
    const value = adapter[prop];
    if (typeof value === "function") return value.bind(adapter);
    return value;
  },
});