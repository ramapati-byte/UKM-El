// services/program.service.ts — Kontrak & adapter Proker (FE-7)

import type {
  ProgramEntity,
  ProgramQuery,
  RankingEntry,
  RankingQuery,
  ProgramService,
} from "../types/program";
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

  async ranking(params?: RankingQuery): Promise<RankingEntry[]> {
    return [...MOCK_RANKING];
  }
}

class ProgramRealService implements ProgramService {
  async list(): Promise<{ data: ProgramEntity[]; total: number }> {
    throw new Error("Real adapter belum tersedia");
  }
  async detail(): Promise<ProgramEntity> {
    throw new Error("Real adapter belum tersedia");
  }
  async create(): Promise<ProgramEntity> {
    throw new Error("Real adapter belum tersedia");
  }
  async update(): Promise<ProgramEntity> {
    throw new Error("Real adapter belum tersedia");
  }
  async delete(): Promise<void> {
    throw new Error("Real adapter belum tersedia");
  }
  async updateProgress(): Promise<ProgramEntity> {
    throw new Error("Real adapter belum tersedia");
  }
  async ranking(): Promise<RankingEntry[]> {
    throw new Error("Real adapter belum tersedia");
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