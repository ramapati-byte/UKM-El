// services/letter.service.ts — Kontrak & adapter Surat (FE-4)

import type {
  LetterEntity,
  LetterQuery,
  LetterCreatePayload,
  LetterStatusPayload,
  LetterTemplate,
  LetterService,
} from "../types/letter";
import { isMockEnabled } from "../lib/env";
import { MOCK_LETTERS, MOCK_LETTER_TEMPLATES } from "../mocks/letter.mock";

class LetterMockService implements LetterService {
  private letters = [...MOCK_LETTERS];
  private templates = [...MOCK_LETTER_TEMPLATES];
  private counter = this.letters.length;

  async list(params?: LetterQuery): Promise<{ data: LetterEntity[]; total: number }> {
    let result = [...this.letters];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter((l) => l.perihal.toLowerCase().includes(q) || l.nomorSurat.toLowerCase().includes(q));
    }
    if (params?.jenis && params.jenis !== "all") result = result.filter((l) => l.jenis === params.jenis);
    if (params?.status && params.status !== "all") result = result.filter((l) => l.status === params.status);
    if (params?.prioritas && params.prioritas !== "all") result = result.filter((l) => l.prioritas === params.prioritas);
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;
    return { data: result.slice(start, start + limit), total: result.length };
  }

  async detail(id: string): Promise<LetterEntity> {
    const l = this.letters.find((x) => x.id === id);
    if (!l) throw new Error("Surat tidak ditemukan");
    return { ...l };
  }

  async create(payload: LetterCreatePayload): Promise<LetterEntity> {
    const nomorSurat = await this.generateNomorSurat(payload.jenis);
    const id = `ltr-${Date.now()}`;
    const letter: LetterEntity = {
      id,
      nomorSurat,
      jenis: payload.jenis,
      status: "draft",
      prioritas: payload.prioritas ?? "normal",
      perihal: payload.perihal,
      tujuan: payload.tujuan,
      pengirim: payload.pengirim,
      tanggalSurat: payload.tanggalSurat,
      tanggalTerima: undefined,
      fileUrl: payload.fileUrl,
      ukmId: "ukm-bem",
      createdBy: "user-001",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.letters.push(letter);
    this.counter++;
    return letter;
  }

  async updateStatus(id: string, payload: LetterStatusPayload): Promise<LetterEntity> {
    const idx = this.letters.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error("Surat tidak ditemukan");
    this.letters[idx].status = payload.status;
    this.letters[idx].updatedAt = new Date().toISOString();
    return { ...this.letters[idx] };
  }

  async delete(id: string): Promise<void> {
    const idx = this.letters.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error("Surat tidak ditemukan");
    this.letters.splice(idx, 1);
  }

  async listTemplates(): Promise<LetterTemplate[]> {
    return [...this.templates];
  }

  async generateNomorSurat(jenis: string): Promise<string> {
    const now = new Date();
    const tahun = now.getFullYear();
    const bulan = String(now.getMonth() + 1).padStart(2, "0");
    const prefix = jenis === "surat_masuk" ? "SM" : "SK";
    const nomor = String(++this.counter).padStart(3, "0");
    return `${prefix}/${tahun}/${bulan}/${nomor}`;
  }
}

class LetterRealService implements LetterService {
  async list(): Promise<{ data: LetterEntity[]; total: number }> {
    throw new Error("Real adapter belum tersedia");
  }
  async detail(): Promise<LetterEntity> {
    throw new Error("Real adapter belum tersedia");
  }
  async create(): Promise<LetterEntity> {
    throw new Error("Real adapter belum tersedia");
  }
  async updateStatus(): Promise<LetterEntity> {
    throw new Error("Real adapter belum tersedia");
  }
  async delete(): Promise<void> {
    throw new Error("Real adapter belum tersedia");
  }
  async listTemplates(): Promise<LetterTemplate[]> {
    throw new Error("Real adapter belum tersedia");
  }
  async generateNomorSurat(): Promise<string> {
    throw new Error("Real adapter belum tersedia");
  }
}

const mockAdapter = new LetterMockService();
const realAdapter = new LetterRealService();

export const letterService: LetterService = new Proxy({} as LetterService, {
  get(_target, prop: keyof LetterService) {
    const adapter = isMockEnabled() ? mockAdapter : realAdapter;
    const value = adapter[prop];
    if (typeof value === "function") return value.bind(adapter);
    return value;
  },
});