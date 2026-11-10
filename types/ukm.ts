// types/ukm.ts — Tipe domain Manajemen UKM (FE-1)

import type { BaseQuery } from "./common";

export type UkmStatus = "pending" | "verified" | "rejected" | "inactive";

export type UkmCategory = "bem" | "himas" | "unit" | "km";

export interface UkmEntity {
  id: string;
  ukmSlug: string;
  nama: string;
  singkatan?: string;
  visi?: string;
  misi?: string;
  kategori: UkmCategory;
  status: UkmStatus;
  logoUrl?: string;
  kontakPerson?: string;
  email?: string;
  noHp?: string;
  mediaSosial?: Record<string, string>;
  alamat?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UkmQuery extends BaseQuery {
  status?: UkmStatus | "all";
  kategori?: UkmCategory | "all";
  search?: string;
}

export interface UkmCreatePayload {
  ukmSlug: string;
  nama: string;
  singkatan?: string;
  visi?: string;
  misi?: string;
  kategori: UkmCategory;
  logoUrl?: string;
  kontakPerson?: string;
  email?: string;
  noHp?: string;
  alamat?: string;
}

export interface UkmVerifyPayload {
  status: "verified" | "rejected";
  catatan?: string;
}

export interface UkmStats {
  total: number;
  verified: number;
  pending: number;
  rejected: number;
  inactive: number;
}

export interface UkmService {
  list(params?: UkmQuery): Promise<{ data: UkmEntity[]; total: number }>;
  detail(id: string): Promise<UkmEntity>;
  getBySlug(slug: string): Promise<UkmEntity>;
  create(payload: UkmCreatePayload): Promise<UkmEntity>;
  update(id: string, payload: Partial<UkmCreatePayload>): Promise<UkmEntity>;
  verify(id: string, payload: UkmVerifyPayload): Promise<UkmEntity>;
  delete(id: string): Promise<void>;
  stats(): Promise<UkmStats>;
}