// types/announcement.ts — Tipe domain Pengumuman & Notifikasi (FE-8)

import type { BaseQuery } from "./common";

export type AnnouncementAudience = "semua" | "ukm" | "divisi";
export type NotificationType = "info" | "success" | "warning" | "danger";

export interface AnnouncementEntity {
  id: string;
  judul: string;
  isi: string;
  audience: AnnouncementAudience;
  ukmId?: string;
  tanggalMulai: string;
  tanggalBerakhir: string;
  isActive: boolean;
  dibuatOleh: string;
  dibuatPada: string;
  updatedAt: string;
}

export interface AnnouncementQuery extends BaseQuery {
  audience?: AnnouncementAudience | "all";
  isActive?: boolean;
  search?: string;
}

export interface AnnouncementCreatePayload {
  judul: string;
  isi: string;
  audience: AnnouncementAudience;
  ukmId?: string;
  tanggalMulai: string;
  tanggalBerakhir: string;
  isActive?: boolean;
}

export interface NotificationEntity {
  id: string;
  judul: string;
  pesan: string;
  tipe: NotificationType;
  dibaca: boolean;
  url?: string;
  ukmId?: string;
  dibuatPada: string;
}

export interface NotificationQuery extends BaseQuery {
  dibaca?: boolean | "all";
  tipe?: NotificationType | "all";
}

export interface AnnouncementService {
  list(params?: AnnouncementQuery): Promise<{ data: AnnouncementEntity[]; total: number }>;
  detail(id: string): Promise<AnnouncementEntity>;
  create(payload: AnnouncementCreatePayload): Promise<AnnouncementEntity>;
  update(id: string, payload: Partial<AnnouncementCreatePayload>): Promise<AnnouncementEntity>;
  delete(id: string): Promise<void>;
  toggleActive(id: string): Promise<AnnouncementEntity>;
}

export interface NotificationService {
  list(params?: NotificationQuery): Promise<{ data: NotificationEntity[]; total: number }>;
  tandaiDibaca(id: string): Promise<NotificationEntity>;
  tandaiSemuaDibaca(): Promise<void>;
  hapus(id: string): Promise<void>;
  jumlahBelumDibaca(): Promise<number>;
}