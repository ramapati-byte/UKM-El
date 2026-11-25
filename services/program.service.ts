// services/program.service.ts — Kontrak & adapter Proker (FE-7)

import type {
  ProgramEntity,
  ProgramQuery,
  RankingEntry,
  RankingQuery,
  ProgramService,
} from "../types/program";
import api from "../lib/api";
import { isMockEnabled } from "../lib/env";
import { MOCK_PROGRAMS, MOCK_RANKING } from "../mocks/program.mock";

class ProgramMockService implements ProgramService {
  private programs = [...MOCK_PROGRAMS];

  async list(params?: ProgramQuery): Promise<{ data: ProgramEntity[]; total: number }> {
    let result = [...this.programs];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter((p) => p.nama.toLowerCase().includes(q));
    }
    if (params?.status && params.status !== "all") result = result.filter((p) => p.status === params.status);
    if (params?.periode) result = result.filter((p) => p.periode === params.periode);
    if (params?.divisi) result = result.filter((p) => p.divisi === params.divisi);
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;
    return { data: result.slice(start, start + limit), total: result.length };
  }

  async detail(id: string): Promise<ProgramEntity> {
    const p = this.programs.find((x) => x.id === id);
    if (!p) throw new Error("Program tidak ditemukan");
    return { ...p };
  }

  async create(payload: Omit<ProgramEntity, "id" | "createdAt" | "updatedAt">): Promise<ProgramEntity> {
    const id = `prog-${Date.now()}`;
    const program: ProgramEntity = { ...payload, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.programs.push(program);
    return program;
  }

  async update(id: string, payload: Partial<ProgramEntity>): Promise<ProgramEntity> {
    const idx = this.programs.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Program tidak ditemukan");
    this.programs[idx] = { ...this.programs[idx], ...payload, updatedAt: new Date().toISOString() };
    return { ...this.programs[idx] };
  }

  async delete(id: string): Promise<void> {
    const idx = this.programs.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Program tidak ditemukan");
    this.programs.splice(idx, 1);
  }

  async updateProgress(id: string, progres: number, catatan?: string): Promise<ProgramEntity> {
    const idx = this.programs.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Program tidak ditemukan");
    this.programs[idx].realisasi = progres;
    this.programs[idx].updatedAt = new Date().toISOString();
    return { ...this.programs[idx] };
  }

  async ranking(_params?: RankingQuery): Promise<RankingEntry[]> {
    return [...MOCK_RANKING];
  }
}

interface BackendProgramRow {
  id: number | string;
  organizer_id?: number | string;
  nama_program: string;
  deskripsi?: string | null;
  periode?: string | null;
  divisi?: string | null;
  target_peserta?: number | null;
  anggaran?: number | null;
  tanggal_mulai?: string | null;
  tanggal_selesai?: string | null;
  progress?: number | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
}

function mapProgramStatus(raw?: string | null): ProgramEntity["status"] {
  if (raw === "draft" || raw === "aktif" || raw === "selesai" || raw === "dibatalkan") {
    return raw;
  }
  if (raw === "berjalan") return "aktif";
  return "draft";
}

function mapProgramRow(r: BackendProgramRow): ProgramEntity {
  const now = new Date().toISOString();
  return {
    id: String(r.id),
    nama: r.nama_program,
    deskripsi: r.deskripsi || undefined,
    periode: r.periode || String(new Date().getFullYear()),
    target: r.target_peserta ?? 100,
    realisasi: r.progress ?? 0,
    satuan: "%",
    status: mapProgramStatus(r.status),
    ukmId: r.organizer_id ? String(r.organizer_id) : "ukm-default",
    divisi: r.divisi || undefined,
    tanggalMulai: r.tanggal_mulai || now,
    tanggalSelesai: r.tanggal_selesai || now,
    createdBy: r.organizer_id ? `Organizer #${r.organizer_id}` : "Organizer",
    createdAt: r.created_at || now,
    updatedAt: r.updated_at || r.created_at || now,
  };
}

class ProgramRealService implements ProgramService {
  async list(params?: ProgramQuery): Promise<{ data: ProgramEntity[]; total: number }> {
    const res = await api.get<{ data: BackendProgramRow[] }>("/organizer/programs");
    let mapped = (res.data?.data ?? []).map(mapProgramRow);
    if (params?.search) {
      const q = params.search.toLowerCase();
      mapped = mapped.filter((p) => p.nama.toLowerCase().includes(q));
    }
    if (params?.status && params.status !== "all") {
      mapped = mapped.filter((p) => p.status === params.status);
    }
    if (params?.periode) mapped = mapped.filter((p) => p.periode === params.periode);
    if (params?.divisi) mapped = mapped.filter((p) => p.divisi === params.divisi);
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;
    return { data: mapped.slice(start, start + limit), total: mapped.length };
  }

  async detail(id: string): Promise<ProgramEntity> {
    const { data } = await this.list({ limit: 200 });
    const found = data.find((p) => p.id === id);
    if (!found) throw new Error("Program kerja tidak ditemukan");
    return found;
  }

  async create(
    payload: Omit<ProgramEntity, "id" | "createdAt" | "updatedAt">
  ): Promise<ProgramEntity> {
    const res = await api.post<{ id: number | string }>("/organizer/programs", {
      nama_program: payload.nama,
      deskripsi: payload.deskripsi || null,
      periode: payload.periode,
      divisi: payload.divisi || null,
      target_peserta: payload.target,
      tanggal_mulai: payload.tanggalMulai,
      tanggal_selesai: payload.tanggalSelesai,
      progress: payload.realisasi ?? 0,
      status: payload.status,
    });
    const now = new Date().toISOString();
    return {
      ...payload,
      id: String(res.data?.id ?? Date.now()),
      createdAt: now,
      updatedAt: now,
    };
  }

  async update(id: string, payload: Partial<ProgramEntity>): Promise<ProgramEntity> {
    const current = await this.detail(id);
    const merged = { ...current, ...payload };
    await api.put(`/organizer/programs/${id}`, {
      nama_program: merged.nama,
      deskripsi: merged.deskripsi || null,
      periode: merged.periode,
      divisi: merged.divisi || null,
      target_peserta: merged.target,
      tanggal_mulai: merged.tanggalMulai,
      tanggal_selesai: merged.tanggalSelesai,
      progress: merged.realisasi,
      status: merged.status,
    });
    return { ...merged, updatedAt: new Date().toISOString() };
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/organizer/programs/${id}`);
  }

  async updateProgress(id: string, progres: number): Promise<ProgramEntity> {
    return this.update(id, { realisasi: progres });
  }

  async ranking(params?: RankingQuery): Promise<RankingEntry[]> {
    try {
      const res = await api.get<{
        data?: Array<{
          id?: number | string;
          ukm?: string;
          nama?: string;
          slug?: string;
          total_events?: number;
          total_participants?: number;
          skor?: number;
        }>;
      }>("/admin/ranking");
      const rows = res.data?.data ?? [];
      return rows.map((r, idx) => ({
        ukmId: String(r.id ?? idx + 1),
        ukmNama: r.ukm || r.nama || `UKM #${idx + 1}`,
        ukmSlug: r.slug || (r.ukm || `ukm-${idx + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        skor: r.skor ?? (r.total_events || 0) * 10 + (r.total_participants || 0),
        peringkat: idx + 1,
        totalKegiatan: r.total_events ?? 0,
        totalAnggota: r.total_participants ?? 0,
        periode: params?.periode || String(new Date().getFullYear()),
      }));
    } catch {
      return [];
    }
  }
}

const mockAdapter = new ProgramMockService();
const realAdapter = new ProgramRealService();

export const programService: ProgramService = new Proxy({} as ProgramService, {
  get(_target, prop: keyof ProgramService) {
    const adapter = isMockEnabled() ? mockAdapter : realAdapter;
    const value = adapter[prop];
    if (typeof value === "function") return value.bind(adapter);
    return value;
  },
});