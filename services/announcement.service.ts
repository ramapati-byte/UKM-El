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
import api from "../lib/api";
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

interface BackendAnnouncementRow {
  id: number | string;
  organizer_id?: number | string;
  judul: string;
  isi: string;
  kategori?: string;
  prioritas?: string;
  is_pinned?: number | boolean;
  is_published?: number | boolean;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

function mapAnnouncementRow(r: BackendAnnouncementRow): AnnouncementEntity {
  return {
    id: String(r.id),
    judul: r.judul,
    isi: r.isi,
    audience: "semua",
    ukmId: r.organizer_id ? String(r.organizer_id) : undefined,
    tanggalMulai: r.published_at || r.created_at || new Date().toISOString(),
    tanggalBerakhir: r.published_at || r.created_at || new Date().toISOString(),
    isActive: Boolean(r.is_published ?? true),
    dibuatOleh: r.organizer_id ? `Organizer #${r.organizer_id}` : "Admin",
    dibuatPada: r.created_at || new Date().toISOString(),
    updatedAt: r.updated_at || r.created_at || new Date().toISOString(),
  };
}

class AnnouncementRealService implements AnnouncementService {
  async list(params?: AnnouncementQuery): Promise<{ data: AnnouncementEntity[]; total: number }> {
    let rows: BackendAnnouncementRow[] = [];
    try {
      const res = await api.get<{ data: BackendAnnouncementRow[] }>("/organizer/announcements");
      rows = res.data?.data ?? [];
    } catch {
      const res = await api.get<{ data: BackendAnnouncementRow[] }>("/organizer/announcements/public");
      rows = res.data?.data ?? [];
    }
    let mapped = rows.map(mapAnnouncementRow);
    if (params?.audience && params.audience !== "all") {
      mapped = mapped.filter((a) => a.audience === params.audience);
    }
    if (params?.isActive !== undefined) {
      mapped = mapped.filter((a) => a.isActive === params.isActive);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      mapped = mapped.filter((a) => a.judul.toLowerCase().includes(q));
    }
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;
    return { data: mapped.slice(start, start + limit), total: mapped.length };
  }

  async detail(id: string): Promise<AnnouncementEntity> {
    const { data } = await this.list({ limit: 200 });
    const found = data.find((a) => a.id === id);
    if (!found) throw new Error("Pengumuman tidak ditemukan");
    return found;
  }

  async create(payload: AnnouncementCreatePayload): Promise<AnnouncementEntity> {
    const res = await api.post<{ id: number | string }>("/organizer/announcements", {
      judul: payload.judul,
      isi: payload.isi,
      kategori: payload.audience || "Umum",
      status: payload.isActive !== false ? "published" : "draft",
      is_pinned: 0,
    });
    return {
      id: String(res.data?.id ?? Date.now()),
      judul: payload.judul,
      isi: payload.isi,
      audience: payload.audience,
      ukmId: payload.ukmId,
      tanggalMulai: payload.tanggalMulai,
      tanggalBerakhir: payload.tanggalBerakhir,
      isActive: payload.isActive ?? true,
      dibuatOleh: "Organizer",
      dibuatPada: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async update(id: string, payload: Partial<AnnouncementCreatePayload>): Promise<AnnouncementEntity> {
    const current = await this.detail(id);
    await api.put(`/organizer/announcements/${id}`, {
      judul: payload.judul ?? current.judul,
      isi: payload.isi ?? current.isi,
      kategori: payload.audience ?? current.audience,
      status: (payload.isActive ?? current.isActive) ? "published" : "draft",
    });
    return { ...current, ...payload, updatedAt: new Date().toISOString() };
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/organizer/announcements/${id}`);
  }

  async toggleActive(id: string): Promise<AnnouncementEntity> {
    const current = await this.detail(id);
    return this.update(id, { isActive: !current.isActive });
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

interface BackendNotificationRow {
  id: number | string;
  title?: string;
  judul?: string;
  message?: string;
  pesan?: string;
  type?: string;
  is_read?: number | boolean;
  link?: string;
  created_at?: string;
}

function mapNotificationRow(r: BackendNotificationRow): NotificationEntity {
  const rawType = (r.type || "info").toLowerCase();
  const tipe =
    rawType === "success" || rawType === "warning" || rawType === "danger"
      ? rawType
      : "info";
  return {
    id: String(r.id),
    judul: r.judul || r.title || "Notifikasi",
    pesan: r.pesan || r.message || "",
    tipe,
    dibaca: Boolean(r.is_read),
    url: r.link || undefined,
    dibuatPada: r.created_at || new Date().toISOString(),
  };
}

class NotificationRealService implements NotificationService {
  async list(params?: NotificationQuery): Promise<{ data: NotificationEntity[]; total: number }> {
    const res = await api.get<{ data: BackendNotificationRow[] }>("/notifications", {
      params: { limit: params?.limit ?? 30 },
    });
    let mapped = (res.data?.data ?? []).map(mapNotificationRow);
    if (params?.dibaca !== undefined && params.dibaca !== "all") {
      mapped = mapped.filter((n) => n.dibaca === params.dibaca);
    }
    if (params?.tipe && params.tipe !== "all") {
      mapped = mapped.filter((n) => n.tipe === params.tipe);
    }
    return { data: mapped, total: mapped.length };
  }

  async tandaiDibaca(id: string): Promise<NotificationEntity> {
    await api.patch(`/notifications/${id}/read`);
    const { data } = await this.list({ limit: 50 });
    const found = data.find((n) => n.id === id);
    return (
      found || {
        id,
        judul: "Notifikasi",
        pesan: "",
        tipe: "info",
        dibaca: true,
        dibuatPada: new Date().toISOString(),
      }
    );
  }

  async tandaiSemuaDibaca(): Promise<void> {
    await api.patch("/notifications/read-all");
  }

  async hapus(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  }

  async jumlahBelumDibaca(): Promise<number> {
    const res = await api.get<{ unread_count?: number }>("/notifications", {
      params: { limit: 1 },
    });
    return res.data?.unread_count ?? 0;
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