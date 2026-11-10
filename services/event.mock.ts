// services/event.mock.ts — Implementasi mock adapter untuk EventService

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
import {
  getMockEvents,
  getMockEventById,
  saveMockEvent,
  deleteMockEvent,
  updateMockEventStatus,
  getMockCalendarEvents,
  checkMockConflict,
  MOCK_ROOMS,
  getMockCommittees,
  addMockCommittee,
  removeMockCommittee,
  searchMockStudents,
  getMockLPJ,
  saveMockLPJ,
  getMockAttendanceSummary,
} from "../mocks/event.mock";
import type { EventService } from "./event.service";

/** Simulasi latency network ringan agar loading skeleton terlihat realistis */
const sleep = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export class EventMockService implements EventService {
  async list(params: EventQuery = {}): Promise<Paginated<EventEntity>> {
    await sleep();
    let data = getMockEvents();

    if (params.search) {
      const q = params.search.toLowerCase();
      data = data.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q)
      );
    }

    if (params.status) {
      data = data.filter((e) => e.status === params.status);
    }

    if (params.visibility) {
      data = data.filter((e) => e.visibility === params.visibility);
    }

    if (params.type) {
      data = data.filter((e) => e.type === params.type);
    }

    if (params.ukm_id) {
      data = data.filter((e) => e.ukm_id === params.ukm_id);
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const total_records = data.length;
    const total_pages = Math.ceil(total_records / limit) || 1;
    const offset = (page - 1) * limit;
    const paginatedData = data.slice(offset, offset + limit);

    return {
      data: paginatedData,
      pagination: {
        total_records,
        total_pages,
        current_page: page,
        limit,
      },
    };
  }

  async getById(id: number): Promise<EventEntity> {
    await sleep();
    const event = getMockEventById(id);
    if (!event) {
      throw new Error("Event tidak ditemukan");
    }
    return event;
  }

  async create(payload: EventCreatePayload): Promise<EventEntity> {
    await sleep();
    const mappedSponsors = payload.sponsors?.map((s, idx) => ({
      id: idx + 1,
      event_id: 0,
      name: s.name,
      logo_url: s.logo_url || "",
    }));

    const created = saveMockEvent({
      title: payload.title,
      description: payload.description,
      starts_at: payload.starts_at,
      ends_at: payload.ends_at ?? null,
      location: payload.location,
      room_id: payload.room_id ?? null,
      visibility: payload.visibility,
      type: payload.type,
      price: payload.price || 0,
      penalty_amount: payload.penalty_amount || 0,
      max_participants: payload.max_participants || 0,
      status: "draft",
      sponsors: mappedSponsors,
    });
    return created;
  }

  async update(id: number, payload: EventUpdatePayload): Promise<EventEntity> {
    await sleep();
    const existing = getMockEventById(id);
    if (!existing) {
      throw new Error("Event tidak ditemukan");
    }

    const { sponsors: payloadSponsors, ...restPayload } = payload;
    const mappedSponsors = payloadSponsors?.map((s, idx) => ({
      id: idx + 1,
      event_id: id,
      name: s.name,
      logo_url: s.logo_url || "",
    }));

    const updated = saveMockEvent({
      ...existing,
      ...restPayload,
      ...(mappedSponsors !== undefined ? { sponsors: mappedSponsors } : {}),
      id,
    });
    return updated;
  }

  async delete(id: number): Promise<void> {
    await sleep();
    const success = deleteMockEvent(id);
    if (!success) {
      throw new Error("Event tidak ditemukan atau gagal dihapus");
    }
  }

  async updateStatus(id: number, status: EventStatus): Promise<void> {
    await sleep();
    const success = updateMockEventStatus(id, status);
    if (!success) {
      throw new Error("Event tidak ditemukan");
    }
  }

  async getCalendar(from?: string, to?: string, ukm_id?: string): Promise<CalendarEvent[]> {
    await sleep();
    return getMockCalendarEvents(from, to, ukm_id);
  }

  async checkConflict(req: ConflictCheckRequest): Promise<ConflictCheckResult> {
    await sleep(80);
    return checkMockConflict(req);
  }

  async getRooms(): Promise<Room[]> {
    await sleep(50);
    return [...MOCK_ROOMS];
  }

  async getCommittees(eventId: number): Promise<EventCommittee[]> {
    await sleep();
    return getMockCommittees(eventId);
  }

  async addCommittee(
    payload: CommitteeCreatePayload & { name?: string; email?: string; phone?: string }
  ): Promise<EventCommittee> {
    await sleep();
    return addMockCommittee({
      event_id: payload.event_id,
      member_id: payload.member_id,
      name: payload.name || "Mahasiswa",
      role: payload.role,
      division: payload.division,
      email: payload.email,
      phone: payload.phone,
    });
  }

  async removeCommittee(committeeId: number): Promise<void> {
    await sleep();
    const ok = removeMockCommittee(committeeId);
    if (!ok) {
      throw new Error("Anggota panitia tidak ditemukan");
    }
  }

  async searchMahasiswa(
    query: string
  ): Promise<
    Array<{ id: number; nim: string; nama_lengkap: string; email: string; no_whatsapp?: string }>
  > {
    await sleep(60);
    return searchMockStudents(query);
  }

  async getLPJ(eventId: number): Promise<EventLPJ | null> {
    await sleep();
    return getMockLPJ(eventId);
  }

  async saveLPJ(eventId: number, payload: LPJSavePayload): Promise<EventLPJ> {
    await sleep();
    return saveMockLPJ(eventId, {
      summary: payload.summary,
      participant_count: payload.participant_count,
      budget_planned: payload.budget_planned,
      budget_realized: payload.budget_realized,
      status: payload.submit ? "submitted" : "draft",
    });
  }

  async getAttendanceSummary(eventId: number): Promise<AttendanceSummary> {
    await sleep();
    return getMockAttendanceSummary(eventId);
  }

  async getPublicEvents(ukm_slug?: string): Promise<EventEntity[]> {
    await sleep();
    let events = getMockEvents().filter(
      (e) => e.status === "approved" && e.visibility === "public"
    );
    if (ukm_slug) {
      events = events.filter((e) => e.ukm_slug === ukm_slug);
    }
    return events;
  }

  async getPublicEventById(id: number): Promise<EventEntity | null> {
    await sleep();
    const event = getMockEventById(id);
    if (!event) return null;
    if (event.status !== "approved" || event.visibility !== "public") {
      return null;
    }
    return event;
  }
}
