// services/announcement.service.ts — Kontrak & adapter Pengumuman & Notifikasi (FE-8)

import type {
  AnnouncementEntity,
  AnnouncementQuery,
  AnnouncementCreatePayload,
  NotificationEntity,
  NotificationQuery,
  AnnouncementService,
  NotificationService,
} from "../types/announcement";
import { isMockEnabled } from "../lib/env";
import { MOCK_ANNOUNCEMENTS, MOCK_NOTIFICATIONS } from "../mocks/announcement.mock";

class AnnouncementMockService implements AnnouncementService {
  private announcements = [...MOCK_ANNOUNCEMENTS];

  async list(params?: AnnouncementQuery): Promise<{ data: AnnouncementEntity[]; total: number }> {
    let result = [...this.announcements];
    if (params?.audience && params.audience !== "all") result = result.filter((a) => a.audience === params.audience);
    if (params?.isActive !== undefined) result = result.filter((a) => a.isActive === params.isActive);
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter((a) => a.judul.toLowerCase().includes(q));
    }
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;
    return { data: result.slice(start, start + limit), total: result.length };
  }

  async detail(id: string): Promise<AnnouncementEntity> {
    const a = this.announcements.find((x) => x.id === id);
    if (!a) throw new Error("Pengumuman tidak ditemukan");
    return { ...a };
  }

  async create(payload: AnnouncementCreatePayload): Promise<AnnouncementEntity> {
    const id = `ann-${Date.now()}`;
    const ann: AnnouncementEntity = {
      id,
      judul: payload.judul,
      isi: payload.isi,
      audience: payload.audience,
      ukmId: payload.ukmId,
      tanggalMulai: payload.tanggalMulai,
      tanggalBerakhir: payload.tanggalBerakhir,
      isActive: payload.isActive ?? true,
      dibuatOleh: "user-001",
      dibuatPada: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.announcements.push(ann);
    return ann;
  }

  async update(id: string, payload: Partial<AnnouncementCreatePayload>): Promise<AnnouncementEntity> {
    const idx = this.announcements.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Pengumuman tidak ditemukan");
    this.announcements[idx] = { ...this.announcements[idx], ...payload, updatedAt: new Date().toISOString() };
    return { ...this.announcements[idx] };
  }

  async delete(id: string): Promise<void> {
    const idx = this.announcements.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Pengumuman tidak ditemukan");
    this.announcements.splice(idx, 1);
  }

  async toggleActive(id: string): Promise<AnnouncementEntity> {
    const idx = this.announcements.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Pengumuman tidak ditemukan");
    this.announcements[idx].isActive = !this.announcements[idx].isActive;
    this.announcements[idx].updatedAt = new Date().toISOString();
    return { ...this.announcements[idx] };
  }
}

class AnnouncementRealService implements AnnouncementService {
  async list(): Promise<{ data: AnnouncementEntity[]; total: number }> {
    throw new Error("Real adapter belum tersedia");
  }
  async detail(): Promise<AnnouncementEntity> {
    throw new Error("Real adapter belum tersedia");
  }
  async create(): Promise<AnnouncementEntity> {
    throw new Error("Real adapter belum tersedia");
  }
  async update(): Promise<AnnouncementEntity> {
    throw new Error("Real adapter belum tersedia");
  }
  async delete(): Promise<void> {
    throw new Error("Real adapter belum tersedia");
  }
  async toggleActive(): Promise<AnnouncementEntity> {
    throw new Error("Real adapter belum tersedia");
  }
}

const announcementMockAdapter = new AnnouncementMockService();
const announcementRealAdapter = new AnnouncementRealService();
export const announcementService: AnnouncementService = new Proxy({} as AnnouncementService, {
  get(_target, prop: keyof AnnouncementService) {
    const adapter = isMockEnabled() ? announcementMockAdapter : announcementRealAdapter;
    const value = adapter[prop];
    if (typeof value === "function") return value.bind(adapter);
    return value;
  },
});

class NotificationMockService implements NotificationService {
  private notifications = [...MOCK_NOTIFICATIONS];

  async list(params?: NotificationQuery): Promise<{ data: NotificationEntity[]; total: number }> {
    let result = [...this.notifications];
    if (params?.dibaca !== undefined && params.dibaca !== "all") result = result.filter((n) => n.dibaca === params.dibaca);
    if (params?.tipe && params.tipe !== "all") result = result.filter((n) => n.tipe === params.tipe);
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;
    return { data: result.slice(start, start + limit), total: result.length };
  }

  async tandaiDibaca(id: string): Promise<NotificationEntity> {
    const idx = this.notifications.findIndex((n) => n.id === id);
    if (idx === -1) throw new Error("Notifikasi tidak ditemukan");
    this.notifications[idx].dibaca = true;
    return { ...this.notifications[idx] };
  }

  async tandaiSemuaDibaca(): Promise<void> {
    this.notifications.forEach((n) => { n.dibaca = true; });
  }

  async hapus(id: string): Promise<void> {
    const idx = this.notifications.findIndex((n) => n.id === id);
    if (idx === -1) throw new Error("Notifikasi tidak ditemukan");
    this.notifications.splice(idx, 1);
  }

  async jumlahBelumDibaca(): Promise<number> {
    return this.notifications.filter((n) => !n.dibaca).length;
  }
}

class NotificationRealService implements NotificationService {
  async list(): Promise<{ data: NotificationEntity[]; total: number }> {
    throw new Error("Real adapter belum tersedia");
  }
  async tandaiDibaca(): Promise<NotificationEntity> {
    throw new Error("Real adapter belum tersedia");
  }
  async tandaiSemuaDibaca(): Promise<void> {
    throw new Error("Real adapter belum tersedia");
  }
  async hapus(): Promise<void> {
    throw new Error("Real adapter belum tersedia");
  }
  async jumlahBelumDibaca(): Promise<number> {
    throw new Error("Real adapter belum tersedia");
  }
}

const notificationMockAdapter = new NotificationMockService();
const notificationRealAdapter = new NotificationRealService();
export const notificationService: NotificationService = new Proxy({} as NotificationService, {
  get(_target, prop: keyof NotificationService) {
    const adapter = isMockEnabled() ? notificationMockAdapter : notificationRealAdapter;
    const value = adapter[prop];
    if (typeof value === "function") return value.bind(adapter);
    return value;
  },
});