// services/document.service.ts — Kontrak & adapter Dokumen (FE-8)

import type {
  DocumentFolder,
  DocumentEntity,
  DocumentQuery,
  DocumentVersion,
  DocumentService,
} from "../types/document";
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
      tipe: "lainnya" as any,
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

  async download(id: string): Promise<Blob> {
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

class DocumentRealService implements DocumentService {
  async listFolders(): Promise<DocumentFolder[]> {
    throw new Error("Real adapter belum tersedia");
  }
  async listDocuments(): Promise<{ data: DocumentEntity[]; total: number }> {
    throw new Error("Real adapter belum tersedia");
  }
  async detail(): Promise<DocumentEntity> {
    throw new Error("Real adapter belum tersedia");
  }
  async upload(): Promise<DocumentEntity> {
    throw new Error("Real adapter belum tersedia");
  }
  async download(): Promise<Blob> {
    throw new Error("Real adapter belum tersedia");
  }
  async delete(): Promise<void> {
    throw new Error("Real adapter belum tersedia");
  }
  async listVersions(): Promise<DocumentVersion[]> {
    throw new Error("Real adapter belum tersedia");
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