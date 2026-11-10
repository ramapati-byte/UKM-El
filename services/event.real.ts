// services/event.real.ts — Implementasi adapter nyata yang memetakan ke endpoint backend-event

import api from "../lib/api";
import type { Paginated } from "../types/common";
import type {
  EventEntity,
  EventQuery,
  EventCreatePayload,
  EventUpdatePayload,
  EventStatus,
  CalendarEvent,
  ConflictCheckRequest,
  ConflictCheckResult,
  Room,
  EventCommittee,
  CommitteeCreatePayload,
  EventLPJ,
  LPJSavePayload,
  AttendanceSummary,
} from "../types/event";
import { MOCK_ROOMS } from "../mocks/event.mock";
import { overlaps } from "../lib/date";
import type { EventService } from "./event.service";

interface BackendWorkshop {
  id: number;
  penyelenggara_id?: number;
  judul: string;
  deskripsi?: string;
  poster?: string | null;
  tanggal_waktu: string;
  jam_selesai?: string | null;
  lokasi?: string;
  visibilitas?: string;
  tipe_event?: string;
  harga?: number | string;
  nominal_denda?: number | string;
  maksimal_peserta?: number | string;
  status?: string;
  is_kuesioner_active?: number | boolean;
  is_diskusi_active?: number | boolean;
  nama_penyelenggara?: string;
  ukm_penyelenggara?: string;
  created_at?: string;
  total_participants?: number;
  sponsors?: Array<{
    id: number;
    event_id: number;
    nama_sponsor: string;
    logo?: string;
  }>;
}

interface BackendTimItem {
  id: number;
  event_id?: number;
  mahasiswa_id?: number;
  nama_lengkap: string;
  email?: string;
  no_whatsapp?: string;
  role: string;
  created_at?: string;
}

interface BackendPendaftarItem {
  id: number;
  status_kehadiran?: string;
}

/** Mapper data backend `workshops` → `EventEntity` frontend */
function mapWorkshopToEntity(w: BackendWorkshop): EventEntity {
  return {
    id: w.id,
    ukm_id: w.ukm_penyelenggara || "ukm-default",
    ukm_name: w.ukm_penyelenggara || "UKM Penyelenggara",
    title: w.judul,
    slug: w.judul ? w.judul.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `event-${w.id}`,
    description: w.deskripsi || "",
    poster_url: w.poster ? `/uploads/${w.poster}` : null,
    starts_at: w.tanggal_waktu,
    ends_at: w.jam_selesai || null,
    location: w.lokasi || "",
    room_id: null,
    room_name: null,
    visibility: w.visibilitas === "internal" ? "internal" : "public",
    type: w.tipe_event === "berbayar" ? "paid" : "free",
    price: Number(w.harga) || 0,
    penalty_amount: Number(w.nominal_denda) || 0,
    max_participants: Number(w.maksimal_peserta) || 0,
    status: (w.status as EventStatus) || "draft",
    is_questionnaire_active: Boolean(w.is_kuesioner_active),
    is_discussion_active: Boolean(w.is_diskusi_active),
    created_by: w.penyelenggara_id || 0,
    organizer_name: w.nama_penyelenggara,
    created_at: w.created_at || new Date().toISOString(),
    counts: {
      registrants: Number(w.total_participants) || 0,
      attendees: 0,
      committees: 0,
    },
    sponsors: Array.isArray(w.sponsors)
      ? w.sponsors.map((s) => ({
          id: s.id,
          event_id: s.event_id,
          name: s.nama_sponsor,
          logo_url: s.logo ? `/uploads/${s.logo}` : "",
        }))
      : [],
  };
}

export class EventRealService implements EventService {
  async list(params: EventQuery = {}): Promise<Paginated<EventEntity>> {
    const res = await api.get("/events/manage", {
      params: {
        search: params.search || "",
        page: params.page || 1,
        limit: params.limit || 10,
      },
    });

    const data: EventEntity[] = (res.data.data || []).map(mapWorkshopToEntity);
    return {
      data,
      pagination: res.data.pagination || {
        total_records: data.length,
        total_pages: 1,
        current_page: params.page || 1,
        limit: params.limit || 10,
      },
    };
  }

  async getById(id: number): Promise<EventEntity> {
    const res = await api.get(`/events/${id}`);
    return mapWorkshopToEntity(res.data);
  }

  async create(payload: EventCreatePayload): Promise<EventEntity> {
    const formData = new FormData();
    formData.append("judul", payload.title);
    formData.append("deskripsi", payload.description);
    formData.append(
      "tanggal_waktu",
      payload.starts_at.includes("T")
        ? payload.starts_at.replace("T", " ") + ":00"
        : payload.starts_at
    );
    if (payload.ends_at) {
      formData.append(
        "jam_selesai",
        payload.ends_at.includes("T")
          ? payload.ends_at.replace("T", " ") + ":00"
          : payload.ends_at
      );
    }
    formData.append("lokasi", payload.location);
    formData.append("visibilitas", payload.visibility);
    formData.append("tipe_event", payload.type === "paid" ? "berbayar" : "gratis");
    formData.append("harga", String(payload.price || 0));
    formData.append("nominal_denda", String(payload.penalty_amount || 0));
    formData.append("maksimal_peserta", String(payload.max_participants || 0));

    if (payload.poster) {
      formData.append("poster", payload.poster);
    }

    if (payload.sponsors && payload.sponsors.length > 0) {
      let logoIndex = 0;
      const sponsorsMeta = payload.sponsors.map((s) => {
        const hasLogo = Boolean(s.logo);
        return {
          nama: s.name,
          has_new_logo: hasLogo,
          logo_index: hasLogo ? logoIndex++ : -1,
        };
      });
      formData.append("sponsors", JSON.stringify(sponsorsMeta));
      payload.sponsors.forEach((s) => {
        if (s.logo) {
          formData.append("sponsor_logos", s.logo);
        }
      });
    }

    const res = await api.post("/events", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const newId = res.data.id;
    return this.getById(newId);
  }

  async update(id: number, payload: EventUpdatePayload): Promise<EventEntity> {
    const formData = new FormData();
    if (payload.title) formData.append("judul", payload.title);
    if (payload.description) formData.append("deskripsi", payload.description);
    if (payload.starts_at) {
      formData.append(
        "tanggal_waktu",
        payload.starts_at.includes("T")
          ? payload.starts_at.replace("T", " ") + ":00"
          : payload.starts_at
      );
    }
    if (payload.ends_at) {
      formData.append(
        "jam_selesai",
        payload.ends_at.includes("T")
          ? payload.ends_at.replace("T", " ") + ":00"
          : payload.ends_at
      );
    }
    if (payload.location) formData.append("lokasi", payload.location);
    if (payload.visibility) formData.append("visibilitas", payload.visibility);
    if (payload.type) {
      formData.append("tipe_event", payload.type === "paid" ? "berbayar" : "gratis");
    }
    if (payload.price !== undefined) formData.append("harga", String(payload.price));
    if (payload.penalty_amount !== undefined) {
      formData.append("nominal_denda", String(payload.penalty_amount));
    }
    if (payload.max_participants !== undefined) {
      formData.append("maksimal_peserta", String(payload.max_participants));
    }
    if (payload.poster) {
      formData.append("poster", payload.poster);
    }

    await api.put(`/events/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return this.getById(id);
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/events/${id}`);
  }

  async updateStatus(id: number, status: EventStatus): Promise<void> {
    await api.patch(`/events/${id}/status`, { status });
  }

  async getCalendar(from?: string, to?: string): Promise<CalendarEvent[]> {
    // Mode real: Ambil semua event yang dapat diakses dan petakan ke kalender
    try {
      const res = await api.get("/events/manage", { params: { limit: 100 } });
      let list: BackendWorkshop[] = res.data.data || [];

      if (from) {
        const fromDate = new Date(from);
        list = list.filter((w) => new Date(w.tanggal_waktu) >= fromDate);
      }
      if (to) {
        const toDate = new Date(to);
        list = list.filter((w) => new Date(w.tanggal_waktu) <= toDate);
      }

      return list.map((w) => {
        let color: CalendarEvent["color_token"] = "primary";
        if (w.status === "draft") color = "warning";
        else if (w.status === "approved") color = "success";
        else if (w.status === "rejected") color = "danger";

        return {
          id: w.id,
          title: w.judul,
          starts_at: w.tanggal_waktu,
          ends_at: w.jam_selesai || null,
          room_id: null,
          room_name: w.lokasi,
          ukm_id: w.ukm_penyelenggara || "ukm-default",
          ukm_name: w.ukm_penyelenggara || "UKM Penyelenggara",
          status: (w.status as EventStatus) || "draft",
          color_token: color,
        };
      });
    } catch {
      return [];
    }
  }

  async checkConflict(req: ConflictCheckRequest): Promise<ConflictCheckResult> {
    // Mode real fallback: hitung bentrok secara client-side dari event yang ada
    try {
      const res = await api.get("/events/manage", { params: { limit: 100 } });
      const events = res.data.data || [];
      const newStart = new Date(req.starts_at);
      const newEnd = req.ends_at ? new Date(req.ends_at) : null;
      const conflicts: ConflictCheckResult["conflicts"] = [];

      for (const e of events) {
        if (req.exclude_event_id && e.id === req.exclude_event_id) continue;
        const eStart = new Date(e.tanggal_waktu);
        const eEnd = e.jam_selesai ? new Date(e.jam_selesai) : null;

        if (overlaps(newStart, newEnd, eStart, eEnd)) {
          conflicts.push({
            type: "schedule",
            event_id: e.id,
            event_title: e.judul,
            starts_at: e.tanggal_waktu,
            ends_at: e.jam_selesai || null,
            message: `Jadwal bertabrakan dengan event "${e.judul}".`,
          });
        }
      }

      return {
        has_conflict: conflicts.length > 0,
        conflicts,
      };
    } catch {
      return { has_conflict: false, conflicts: [] };
    }
  }

  async getRooms(): Promise<Room[]> {
    // Menunggu modul inventaris; fallback master ruangan statis
    return [...MOCK_ROOMS];
  }

  async getCommittees(eventId: number): Promise<EventCommittee[]> {
    try {
      const res = await api.get("/tim");
      const list: BackendTimItem[] = res.data || [];
      return list
        .filter((t) => t.event_id === eventId)
        .map((t) => ({
          id: t.id,
          event_id: eventId,
          member_id: t.mahasiswa_id || 0,
          name: t.nama_lengkap,
          email: t.email,
          phone: t.no_whatsapp,
          role: t.role,
          created_at: t.created_at,
        }));
    } catch {
      return [];
    }
  }

  async addCommittee(
    payload: CommitteeCreatePayload & { name?: string; email?: string; phone?: string }
  ): Promise<EventCommittee> {
    const res = await api.post("/tim", {
      workshop_id: payload.event_id,
      mahasiswa_id: payload.member_id,
      role: payload.role,
    });
    return {
      id: res.data.id || Date.now(),
      event_id: payload.event_id,
      member_id: payload.member_id,
      name: payload.name || "Mahasiswa",
      role: payload.role,
      division: payload.division,
      email: payload.email,
      phone: payload.phone,
    };
  }

  async removeCommittee(committeeId: number): Promise<void> {
    await api.delete(`/tim/${committeeId}`);
  }

  async searchMahasiswa(
    query: string
  ): Promise<
    Array<{ id: number; nim: string; nama_lengkap: string; email: string; no_whatsapp?: string }>
  > {
    try {
      const res = await api.get("/tim/search", { params: { q: query } });
      return res.data || [];
    } catch {
      return [];
    }
  }

  async getLPJ(_eventId: number): Promise<EventLPJ | null> {
    // Backend belum memiliki tabel LPJ; tampilkan null atau simpan lokal
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`lpj_${_eventId}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return null;
  }

  async saveLPJ(eventId: number, payload: LPJSavePayload): Promise<EventLPJ> {
    const lpj: EventLPJ = {
      id: Date.now(),
      event_id: eventId,
      summary: payload.summary,
      participant_count: payload.participant_count,
      budget_planned: payload.budget_planned,
      budget_realized: payload.budget_realized,
      status: payload.submit ? "submitted" : "draft",
      attachments: [],
      created_at: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(`lpj_${eventId}`, JSON.stringify(lpj));
    }
    return lpj;
  }

  async getAttendanceSummary(eventId: number): Promise<AttendanceSummary> {
    try {
      const res = await api.get(`/pendaftar/${eventId}`);
      const list: BackendPendaftarItem[] = res.data || [];
      const total = list.length;
      const attended = list.filter((p) => p.status_kehadiran === "hadir").length;
      return {
        event_id: eventId,
        total_registrants: total,
        total_attendees: attended,
        attendance_rate: total > 0 ? Math.round((attended / total) * 100) : 0,
      };
    } catch {
      return {
        event_id: eventId,
        total_registrants: 0,
        total_attendees: 0,
        attendance_rate: 0,
      };
    }
  }

  async getPublicEvents(): Promise<EventEntity[]> {
    const res = await api.get("/events");
    return (res.data || []).map(mapWorkshopToEntity);
  }

  async getPublicEventById(id: number): Promise<EventEntity | null> {
    try {
      const res = await api.get(`/events/${id}`);
      const entity = mapWorkshopToEntity(res.data);
      if (entity.status !== "approved" || entity.visibility !== "public") {
        return null;
      }
      return entity;
    } catch {
      return null;
    }
  }
}
