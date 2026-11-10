// services/ukm.service.ts — Kontrak & adapter UKM (FE-1)

import type { Paginated } from "../types/common";
import type {
  UkmEntity,
  UkmQuery,
  UkmCreatePayload,
  UkmVerifyPayload,
  UkmStats,
  UkmService,
} from "../types/ukm";
import { isMockEnabled } from "../lib/env";
import { MOCK_UKMS } from "../mocks/ukm.mock";

// ─── Mock adapter ────────────────────────────────────────

class UkmMockService implements UkmService {
  private ukms = [...MOCK_UKMS];

  async list(params?: UkmQuery): Promise<{ data: UkmEntity[]; total: number }> {
    let result = [...this.ukms];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter((u) => u.nama.toLowerCase().includes(q) || u.ukmSlug?.toLowerCase().includes(q));
    }
    if (params?.status && params.status !== "all") {
      result = result.filter((u) => u.status === params.status);
    }
    if (params?.kategori && params.kategori !== "all") {
      result = result.filter((u) => u.kategori === params.kategori);
    }
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;
    const paginated = result.slice(start, start + limit);
    return { data: paginated, total: result.length };
  }

  async detail(id: string): Promise<UkmEntity> {
    const ukm = this.ukms.find((u) => u.id === id);
    if (!ukm) throw new Error("UKM tidak ditemukan");
    return { ...ukm };
  }

  async getBySlug(slug: string): Promise<UkmEntity> {
    const ukm = this.ukms.find((u) => u.uktmSlug === slug);
    if (!ukm) throw new Error("UKM tidak ditemukan");
    return { ...ukm };
  }

  async create(payload: UkmCreatePayload): Promise<UkmEntity> {
    const id = `ukm-${Date.now()}`;
    const ukm: UkmEntity = {
      id,
      ukmSlug: payload.ukmSlug,
      nama: payload.nama,
      singkatan: payload.singkatan,
      visi: payload.visi,
      misi: payload.misi,
      kategori: payload.kategori,
      status: "pending",
      logoUrl: payload.logoUrl,
      kontakPerson: payload.kontakPerson,
      email: payload.email,
      noHp: payload.noHp,
      mediaSosial: payload.mediaSosial,
      alamat: payload.alamat,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.ukms.push(ukm);
    return ukm;
  }

  async update(id: string, payload: Partial<UkmCreatePayload>): Promise<UkmEntity> {
    const idx = this.ukms.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error("UKM tidak ditemukan");
    this.ukms[idx] = { ...this.ukms[idx], ...payload, updatedAt: new Date().toISOString() };
    return { ...this.ukms[idx] };
  }

  async verify(id: string, payload: UkmVerifyPayload): Promise<UkmEntity> {
    const idx = this.ukms.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error("UKM tidak ditemukan");
    this.ukms[idx].status = payload.status;
    this.ukms[idx].updatedAt = new Date().toISOString();
    return { ...this.ukms[idx] };
  }

  async delete(id: string): Promise<void> {
    const idx = this.ukms.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error("UKM tidak ditemukan");
    this.ukms.splice(idx, 1);
  }

  async stats(): Promise<UkmStats> {
    const total = this.ukms.length;
    const verified = this.ukms.filter((u) => u.status === "verified").length;
    const pending = this.ukms.filter((u) => u.status === "pending").length;
    const rejected = this.ukms.filter((u) => u.status === "rejected").length;
    const inactive = this.ukms.filter((u) => u.status === "inactive").length;
    return { total, verified, pending, rejected, inactive };
  }
}

// ─── Real adapter (placeholder) ─────────────────────────

class UkmRealService implements UkmService {
  async list(): Promise<{ data: UkmEntity[]; total: number }> {
    throw new Error("Real adapter belum tersedia");
  }
  async detail(): Promise<UkmEntity> {
    throw new Error("Real adapter belum tersedia");
  }
  async getBySlug(): Promise<UkmEntity> {
    throw new Error("Real adapter belum tersedia");
  }
  async create(): Promise<UkmEntity> {
    throw new Error("Real adapter belum tersedia");
  }
  async update(): Promise<UkmEntity> {
    throw new Error("Real adapter belum tersedia");
  }
  async verify(): Promise<UkmEntity> {
    throw new Error("Real adapter belum tersedia");
  }
  async delete(): Promise<void> {
    throw new Error("Real adapter belum tersedia");
  }
  async stats(): Promise<UkmStats> {
    throw new Error("Real adapter belum tersedia");
  }
}

// ─── Singleton proxy ─────────────────────────────────────

const mockAdapter = new UkmMockService();
const realAdapter = new UkmRealService();

export const ukmService: UkmService = new Proxy({} as UkmService, {
  get(_target, prop: keyof UkmService) {
    const adapter = isMockEnabled() ? mockAdapter : realAdapter;
    const value = adapter[prop];
    if (typeof value === "function") {
      return value.bind(adapter);
    }
    return value;
  },
});