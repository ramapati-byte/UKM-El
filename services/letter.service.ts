// services/letter.service.ts — Kontrak & adapter Surat (FE-4)

import type {
  LetterEntity,
  LetterQuery,
  LetterCreatePayload,
  LetterStatusPayload,
  LetterTemplate,
  LetterService,
} from "../types/letter";
import api from "../lib/api";
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

interface BackendLetterRow {
  id: number | string;
  organizer_id?: number | string;
  nomor_surat: string;
  jenis_surat?: string;
  perihal: string;
  tujuan?: string | null;
  isi_surat?: string | null;
  tanggal_surat?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

function mapLetterRow(r: BackendLetterRow): LetterEntity {
  const now = new Date().toISOString();
  const status: LetterEntity["status"] =
    r.status === "terkirim"
      ? "disetujui"
      : r.status === "arsip"
      ? "diarsip"
      : r.status === "draft"
      ? "draft"
      : "diajukan";
  return {
    id: String(r.id),
    nomorSurat: r.nomor_surat || `SRT-${r.id}`,
    jenis: r.jenis_surat === "masuk" ? "surat_masuk" : "surat_keluar",
    status,
    prioritas: "normal",
    perihal: r.perihal,
    tujuan: r.tujuan || null,
    pengirim: null,
    tanggalSurat: r.tanggal_surat || now,
    fileUrl: null,
    ukmId: r.organizer_id ? String(r.organizer_id) : "ukm-default",
    createdBy: r.organizer_id ? `Organizer #${r.organizer_id}` : "Organizer",
    createdAt: r.created_at || now,
    updatedAt: r.updated_at || r.created_at || now,
  };
}

class LetterRealService implements LetterService {
  async list(params?: LetterQuery): Promise<{ data: LetterEntity[]; total: number }> {
    const res = await api.get<{ data: BackendLetterRow[] }>("/organizer/letters");
    let mapped = (res.data?.data ?? []).map(mapLetterRow);
    if (params?.search) {
      const q = params.search.toLowerCase();
      mapped = mapped.filter(
        (l) => l.perihal.toLowerCase().includes(q) || l.nomorSurat.toLowerCase().includes(q)
      );
    }
    if (params?.jenis && params.jenis !== "all") {
      mapped = mapped.filter((l) => l.jenis === params.jenis);
    }
    if (params?.status && params.status !== "all") {
      mapped = mapped.filter((l) => l.status === params.status);
    }
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;
    return { data: mapped.slice(start, start + limit), total: mapped.length };
  }

  async detail(id: string): Promise<LetterEntity> {
    const res = await api.get<{ data?: BackendLetterRow } & BackendLetterRow>(`/organizer/letters/${id}`);
    const row = res.data?.data || res.data;
    return mapLetterRow(row);
  }

  async create(payload: LetterCreatePayload): Promise<LetterEntity> {
    const nomor = await this.generateNomorSurat(payload.jenis);
    const res = await api.post<{ id: number | string }>("/organizer/letters", {
      nomor_surat: nomor,
      jenis_surat: payload.jenis === "surat_masuk" ? "masuk" : "keluar",
      perihal: payload.perihal,
      tujuan: payload.tujuan || payload.pengirim || null,
      tanggal_surat: payload.tanggalSurat,
      status: "draft",
    });
    const now = new Date().toISOString();
    return {
      id: String(res.data?.id ?? Date.now()),
      nomorSurat: nomor,
      jenis: payload.jenis,
      status: "diajukan",
      prioritas: payload.prioritas || "normal",
      perihal: payload.perihal,
      tujuan: payload.tujuan || null,
      pengirim: payload.pengirim || null,
      tanggalSurat: payload.tanggalSurat,
      fileUrl: payload.fileUrl || null,
      ukmId: "ukm-default",
      createdBy: "Organizer",
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateStatus(id: string, payload: LetterStatusPayload): Promise<LetterEntity> {
    const current = await this.detail(id);
    const backendStatus =
      payload.status === "disetujui"
        ? "terkirim"
        : payload.status === "diarsip"
        ? "arsip"
        : "draft";
    await api.put(`/organizer/letters/${id}`, {
      nomor_surat: current.nomorSurat,
      jenis_surat: current.jenis === "surat_masuk" ? "masuk" : "keluar",
      perihal: current.perihal,
      tujuan: current.tujuan || current.pengirim,
      tanggal_surat: current.tanggalSurat,
      status: backendStatus,
    });
    return { ...current, status: payload.status, updatedAt: new Date().toISOString() };
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/organizer/letters/${id}`);
  }

  async listTemplates(): Promise<LetterTemplate[]> {
    return [...MOCK_LETTER_TEMPLATES];
  }

  async generateNomorSurat(jenis: "surat_masuk" | "surat_keluar"): Promise<string> {
    const prefix = jenis === "surat_masuk" ? "SM" : "SK";
    const year = new Date().getFullYear();
    const rand = String(Math.floor(100 + Math.random() * 900));
    return `${rand}/${prefix}/BEM/${year}`;
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