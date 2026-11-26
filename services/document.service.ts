// services/document.service.ts — Kontrak & adapter Dokumen (FE-8)

import type {
  DocumentFolder,
  DocumentEntity,
  DocumentQuery,
  DocumentVersion,
  DocumentService,
  DocumentType,
} from "../types/document";
import api from "../lib/api";
import { isMockEnabled } from "../lib/env";
import { MOCK_DOCUMENT_FOLDERS, MOCK_DOCUMENTS, MOCK_DOCUMENT_VERSIONS } from "../mocks/document.mock";

class DocumentMockService implements DocumentService {
  private folders = [...MOCK_DOCUMENT_FOLDERS];
  private documents = [...MOCK_DOCUMENTS];
  private versions = [...MOCK_DOCUMENT_VERSIONS];

  async listFolders(ukmId?: string): Promise<DocumentFolder[]> {
    return this.folders.filter((f) => !ukmId || f.ukmId === ukmId);
  }

  async listDocuments(params?: DocumentQuery): Promise<{ data: DocumentEntity[]; total: number }> {
    let result = [...this.documents];
    if (params?.tipe && params.tipe !== "all") result = result.filter((d) => d.tipe === params.tipe);
    if (params?.folderId) result = result.filter((d) => d.folderId === params.folderId);
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter((d) => d.judul.toLowerCase().includes(q));
    }
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;
    return { data: result.slice(start, start + limit), total: result.length };
  }

  async detail(id: string): Promise<DocumentEntity> {
    const d = this.documents.find((x) => x.id === id);
    if (!d) throw new Error("Dokumen tidak ditemukan");
    return { ...d };
  }

  async upload(formData: FormData): Promise<DocumentEntity> {
    const id = `doc-${Date.now()}`;
    const doc: DocumentEntity = {
      id,
      judul: formData.get("judul")?.toString() ?? "Dokumen baru",
      tipe: (formData.get("tipe")?.toString() as DocumentType) || "lainnya",
      fileUrl: `/uploads/documents/${id}.pdf`,
      ukuranFile: 102400,
      versi: 1,
      folderId: formData.get("folderId")?.toString() ?? undefined,
      ukmId: "ukm-bem",
      diunggahOleh: "user-001",
      diunggahPada: new Date().toISOString(),
      deskripsi: formData.get("deskripsi")?.toString(),
    };
    this.documents.push(doc);
    return doc;
  }

  async download(_id: string): Promise<Blob> {
    return new Blob(["File content"], { type: "application/pdf" });
  }

  async delete(id: string): Promise<void> {
    const idx = this.documents.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error("Dokumen tidak ditemukan");
    this.documents.splice(idx, 1);
  }

  async listVersions(documentId: string): Promise<DocumentVersion[]> {
    return this.versions.filter((v) => v.documentId === documentId);
  }
}

interface BackendFolderRow {
  id: number | string;
  nama: string;
  parent_id?: number | string | null;
  organizer_id?: number | string;
  created_at?: string;
}

interface BackendDocRow {
  id: number | string;
  judul: string;
  tipe?: string;
  file_url?: string;
  ukuran_file?: number;
  versi?: number;
  folder_id?: number | string | null;
  organizer_id?: number | string;
  diunggah_oleh?: string;
  created_at?: string;
  deskripsi?: string | null;
}

function mapDocRow(r: BackendDocRow): DocumentEntity {
  const tipe: DocumentType =
    r.tipe === "surat" ||
    r.tipe === "laporan" ||
    r.tipe === "proker" ||
    r.tipe === "keuangan" ||
    r.tipe === "kepengurusan" ||
    r.tipe === "lainnya"
      ? r.tipe
      : "lainnya";
  return {
    id: String(r.id),
    judul: r.judul,
    tipe,
    fileUrl: r.file_url || "",
    ukuranFile: Number(r.ukuran_file) || 0,
    versi: Number(r.versi) || 1,
    folderId: r.folder_id ? String(r.folder_id) : null,
    ukmId: r.organizer_id ? String(r.organizer_id) : "ukm-default",
    diunggahOleh: r.diunggah_oleh || "Organizer",
    diunggahPada: r.created_at || new Date().toISOString(),
    deskripsi: r.deskripsi ?? null,
  };
}

class DocumentRealService implements DocumentService {
  async listFolders(): Promise<DocumentFolder[]> {
    const res = await api.get<{ data: BackendFolderRow[] }>("/organizer/documents/folders");
    return (res.data?.data ?? []).map((f) => ({
      id: String(f.id),
      nama: f.nama,
      parentId: f.parent_id ? String(f.parent_id) : null,
      ukmId: f.organizer_id ? String(f.organizer_id) : "ukm-default",
      createdAt: f.created_at || new Date().toISOString(),
    }));
  }

  async listDocuments(params?: DocumentQuery): Promise<{ data: DocumentEntity[]; total: number }> {
    const res = await api.get<{ data: BackendDocRow[] }>("/organizer/documents");
    let mapped = (res.data?.data ?? []).map(mapDocRow);
    if (params?.tipe && params.tipe !== "all") {
      mapped = mapped.filter((d) => d.tipe === params.tipe);
    }
    if (params?.folderId) {
      mapped = mapped.filter((d) => d.folderId === params.folderId);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      mapped = mapped.filter((d) => d.judul.toLowerCase().includes(q));
    }
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;
    return { data: mapped.slice(start, start + limit), total: mapped.length };
  }

  async detail(id: string): Promise<DocumentEntity> {
    const { data } = await this.listDocuments({ limit: 200 });
    const found = data.find((d) => d.id === id);
    if (!found) throw new Error(`Dokumen #${id} tidak ditemukan`);
    return found;
  }

  async upload(formData: FormData): Promise<DocumentEntity> {
    const res = await api.post<{ id: number | string }>("/organizer/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return this.detail(String(res.data?.id));
  }

  async download(id: string): Promise<Blob> {
    const doc = await this.detail(id);
    if (doc.fileUrl && doc.fileUrl.startsWith("data:")) {
      const res = await fetch(doc.fileUrl);
      return res.blob();
    }
    return new Blob([doc.judul], { type: "application/pdf" });
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/organizer/documents/${id}`);
  }

  async listVersions(documentId: string): Promise<DocumentVersion[]> {
    const doc = await this.detail(documentId);
    return [
      {
        id: `ver-${doc.id}`,
        documentId: doc.id,
        versi: doc.versi,
        fileUrl: doc.fileUrl,
        ukuranFile: doc.ukuranFile,
        diunggahOleh: doc.diunggahOleh,
        diunggahPada: doc.diunggahPada,
      },
    ];
  }
}

const mockAdapter = new DocumentMockService();
const realAdapter = new DocumentRealService();

export const documentService: DocumentService = new Proxy({} as DocumentService, {
  get(_target, prop: keyof DocumentService) {
    const adapter = isMockEnabled() ? mockAdapter : realAdapter;
    const value = adapter[prop];
    if (typeof value === "function") return value.bind(adapter);
    return value;
  },
});