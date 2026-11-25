// services/ukm.service.ts — Kontrak & adapter UKM (FE-1)

import type { Paginated } from "../types/common";
import type {
  UkmEntity,
  UkmQuery,
  UkmCreatePayload,
  UkmVerifyPayload,
  UkmStats,
  UkmService,
  UkmCategory,
  UkmStatus,
} from "../types/ukm";
import api from "../lib/api";
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
    const ukm = this.ukms.find((u) => u.ukmSlug === slug);
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

// ─── Real adapter ────────────────────────────────────────

interface BackendUkmRow {
  id: number | string;
  nama: string;
  singkatan?: string | null;
  slug: string;
  deskripsi?: string | null;
  kategori?: string | null;
  logo?: string | null;
  email_resmi?: string | null;
  instagram?: string | null;
  warna_tema?: string | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
}

function mapUkmKategori(raw?: string | null): UkmCategory {
  const val = (raw || "").toLowerCase();
  if (val === "bem" || val === "himas" || val === "unit" || val === "km") {
    return val;
  }
  return "unit";
}

function mapUkmStatus(raw?: string | null): UkmStatus {
  if (raw === "aktif" || raw === "verified") return "verified";
  if (raw === "pending") return "pending";
  if (raw === "rejected") return "rejected";
  return "inactive";
}

function mapBackendUkm(row: BackendUkmRow): UkmEntity {
  return {
    id: String(row.id),
    ukmSlug: row.slug,
    nama: row.nama,
    singkatan: row.singkatan || undefined,
    visi: row.deskripsi || undefined,
    kategori: mapUkmKategori(row.kategori),
    status: mapUkmStatus(row.status),
    logoUrl: row.logo || undefined,
    email: row.email_resmi || undefined,
    mediaSosial: row.instagram ? { instagram: row.instagram } : undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
  };
}

class UkmRealService implements UkmService {
  async list(params?: UkmQuery): Promise<{ data: UkmEntity[]; total: number }> {
    const backendStatus =
      params?.status && params.status !== "all"
        ? params.status === "verified"
          ? "aktif"
          : params.status === "inactive"
          ? "nonaktif"
          : params.status
        : "all";

    const res = await api.get<{ data: BackendUkmRow[]; pagination?: { total?: number } }>("/ukm", {
      params: {
        search: params?.search || undefined,
        kategori: params?.kategori && params.kategori !== "all" ? params.kategori : undefined,
        status: backendStatus,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      },
    });
    const rows = res.data?.data ?? [];
    return {
      data: rows.map(mapBackendUkm),
      total: res.data?.pagination?.total ?? rows.length,
    };
  }

  async detail(id: string): Promise<UkmEntity> {
    const res = await api.get<BackendUkmRow>(`/ukm/${id}`);
    return mapBackendUkm(res.data);
  }

  async getBySlug(slug: string): Promise<UkmEntity> {
    const res = await api.get<BackendUkmRow>(`/ukm/${slug}`);
    return mapBackendUkm(res.data);
  }

  async create(payload: UkmCreatePayload): Promise<UkmEntity> {
    const res = await api.post<{ id: number | string; slug: string }>("/ukm", {
      nama: payload.nama,
      singkatan: payload.singkatan || null,
      slug: payload.ukmSlug,
      deskripsi: payload.visi || payload.misi || null,
      kategori: payload.kategori,
      logo: payload.logoUrl || null,
      email_resmi: payload.email || null,
      instagram: payload.mediaSosial?.instagram || null,
      status: "aktif",
    });
    return this.detail(String(res.data.id || res.data.slug || payload.ukmSlug));
  }

  async update(id: string, payload: Partial<UkmCreatePayload>): Promise<UkmEntity> {
    const current = await this.detail(id);
    await api.put(`/ukm/${id}`, {
      nama: payload.nama ?? current.nama,
      singkatan: payload.singkatan ?? current.singkatan ?? null,
      deskripsi: payload.visi ?? current.visi ?? null,
      kategori: payload.kategori ?? current.kategori,
      logo: payload.logoUrl ?? current.logoUrl ?? null,
      email_resmi: payload.email ?? current.email ?? null,
      instagram: payload.mediaSosial?.instagram ?? current.mediaSosial?.instagram ?? null,
      status: current.status === "verified" ? "aktif" : "nonaktif",
    });
    return this.detail(id);
  }

  async verify(id: string, payload: UkmVerifyPayload): Promise<UkmEntity> {
    const current = await this.detail(id);
    await api.put(`/ukm/${id}`, {
      nama: current.nama,
      singkatan: current.singkatan ?? null,
      deskripsi: current.visi ?? null,
      kategori: current.kategori,
      logo: current.logoUrl ?? null,
      email_resmi: current.email ?? null,
      instagram: current.mediaSosial?.instagram ?? null,
      status: payload.status === "verified" ? "aktif" : "nonaktif",
    });
    return this.detail(id);
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/ukm/${id}`);
  }

  async stats(): Promise<UkmStats> {
    const { data } = await this.list({ status: "all", limit: 200 });
    return {
      total: data.length,
      verified: data.filter((u) => u.status === "verified").length,
      pending: data.filter((u) => u.status === "pending").length,
      rejected: data.filter((u) => u.status === "rejected").length,
      inactive: data.filter((u) => u.status === "inactive").length,
    };
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