// types/document.ts — Tipe domain Dokumen & Arsip (FE-8)

import type { BaseQuery } from "./common";

export type DocumentType = "surat" | "laporan" | "proker" | "keuangan" | "kepengurusan" | "lainnya";

export interface DocumentFolder {
  id: string;
  nama: string;
  parentId?: string | null;
  ukmId: string;
  createdAt: string;
}

export interface DocumentEntity {
  id: string;
  judul: string;
  tipe: DocumentType;
  fileUrl: string;
  ukuranFile: number;
  versi: number;
  folderId?: string | null;
  ukmId: string;
  diunggahOleh: string;
  diunggahPada: string;
  deskripsi?: string | null;
}

export interface DocumentQuery extends BaseQuery {
  tipe?: DocumentType | "all";
  folderId?: string;
  search?: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versi: number;
  fileUrl: string;
  ukuranFile: number;
  diunggahOleh: string;
  diunggahPada: string;
  catatan?: string;
}

export interface DocumentService {
  listFolders(ukmId?: string): Promise<DocumentFolder[]>;
  listDocuments(params?: DocumentQuery): Promise<{ data: DocumentEntity[]; total: number }>;
  detail(id: string): Promise<DocumentEntity>;
  upload(formData: FormData): Promise<DocumentEntity>;
  download(id: string): Promise<Blob>;
  delete(id: string): Promise<void>;
  listVersions(documentId: string): Promise<DocumentVersion[]>;
}