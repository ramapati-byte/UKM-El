// services/event.service.ts — Kontrak & pemilih adapter (real vs mock)

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
import { isMockEnabled } from "../lib/env";
import { EventMockService } from "./event.mock";
import { EventRealService } from "./event.real";

export interface EventService {
  list(params?: EventQuery): Promise<Paginated<EventEntity>>;
  getById(id: number): Promise<EventEntity>;
  create(payload: EventCreatePayload): Promise<EventEntity>;
  update(id: number, payload: EventUpdatePayload): Promise<EventEntity>;
  delete(id: number): Promise<void>;
  updateStatus(id: number, status: EventStatus): Promise<void>;
  getCalendar(from?: string, to?: string, ukm_id?: string): Promise<CalendarEvent[]>;
  checkConflict(req: ConflictCheckRequest): Promise<ConflictCheckResult>;
  getRooms(): Promise<Room[]>;
  getCommittees(eventId: number): Promise<EventCommittee[]>;
  addCommittee(
    payload: CommitteeCreatePayload & { name?: string; email?: string; phone?: string }
  ): Promise<EventCommittee>;
  removeCommittee(committeeId: number): Promise<void>;
  searchMahasiswa(query: string): Promise<Array<{ id: number; nim: string; nama_lengkap: string; email: string; no_whatsapp?: string }>>;
  getLPJ(eventId: number): Promise<EventLPJ | null>;
  saveLPJ(eventId: number, payload: LPJSavePayload): Promise<EventLPJ>;
  getAttendanceSummary(eventId: number): Promise<AttendanceSummary>;
  getPublicEvents(ukm_slug?: string): Promise<EventEntity[]>;
  getPublicEventById(id: number): Promise<EventEntity | null>;
}

// Inisialisasi singleton adapter
const mockAdapter = new EventMockService();
const realAdapter = new EventRealService();

/**
 * Proxy singleton yang memilih adapter aktif saat runtime.
 * Jika `NEXT_PUBLIC_USE_MOCKS=false`, request diarahkan ke `realAdapter`.
 */
export const eventService: EventService = new Proxy({} as EventService, {
  get(_target, prop: keyof EventService) {
    const adapter = isMockEnabled() ? mockAdapter : realAdapter;
    const value = adapter[prop];
    if (typeof value === "function") {
      return value.bind(adapter);
    }
    return value;
  },
});

export { mockAdapter as eventMockService, realAdapter as eventRealService };
