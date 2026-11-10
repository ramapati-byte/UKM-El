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
} from "../types/inventory";
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

  async returnLoan(id: string, kondisi: string, catatan?: string): Promise<InventoryLoan> {
    const idx = this.loans.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error("Pinjaman tidak ditemukan");
    this.loans[idx].status = "dikembalikan";
    this.loans[idx].kondisiCheckin = kondisi as any;
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

class InventoryRealService implements InventoryService {
  async list(): Promise<{ data: InventoryItem[]; total: number }> {
    throw new Error("Real adapter belum tersedia");
  }
  async detail(): Promise<InventoryItem> {
    throw new Error("Real adapter belum tersedia");
  }
  async create(): Promise<InventoryItem> {
    throw new Error("Real adapter belum tersedia");
  }
  async update(): Promise<InventoryItem> {
    throw new Error("Real adapter belum tersedia");
  }
  async delete(): Promise<void> {
    throw new Error("Real adapter belum tersedia");
  }
  async listLoans(): Promise<{ data: InventoryLoan[]; total: number }> {
    throw new Error("Real adapter belum tersedia");
  }
  async createLoan(): Promise<InventoryLoan> {
    throw new Error("Real adapter belum tersedia");
  }
  async approveLoan(): Promise<InventoryLoan> {
    throw new Error("Real adapter belum tersedia");
  }
  async returnLoan(): Promise<InventoryLoan> {
    throw new Error("Real adapter belum tersedia");
  }
  async checkAvailability(): Promise<boolean> {
    throw new Error("Real adapter belum tersedia");
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