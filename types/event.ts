// types/event.ts — Kontrak tipe domain Event

import type { BaseQuery, BadgeVariant } from "./common";

// ─── Status ──────────────────────────────────────────────

export type EventStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "completed";

export type EventVisibility = "public" | "internal";
export type EventType = "free" | "paid";
export type LPJStatus = "draft" | "submitted" | "approved" | "rejected";

/** Mapping status → badge variant */
export const EVENT_STATUS_MAP: Record<
  EventStatus,
  { label: string; variant: BadgeVariant }
> = {
  draft: { label: "Draft", variant: "warning" },
  pending: { label: "Menunggu", variant: "info" },
  approved: { label: "Disetujui", variant: "success" },
  rejected: { label: "Ditolak", variant: "danger" },
  cancelled: { label: "Dibatalkan", variant: "secondary" },
  completed: { label: "Selesai", variant: "primary" },
};

// ─── Entitas utama ───────────────────────────────────────

export interface EventSponsor {
  id: number;
  event_id: number;
  name: string;
  logo_url: string;
}

export interface EventEntity {
  id: number;
  ukm_id: string;
  ukm_slug?: string;
  ukm_name?: string;
  title: string;
  slug?: string;
  description: string;
  poster_url: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string;
  room_id?: string | null;
  room_name?: string | null;
  visibility: EventVisibility;
  type: EventType;
  price: number;
  penalty_amount: number;
  max_participants: number;
  status: EventStatus;
  is_questionnaire_active?: boolean;
  is_discussion_active?: boolean;
  created_by: number;
  organizer_name?: string;
  created_at: string;
  updated_at?: string;
  sponsors?: EventSponsor[];
  counts?: EventCounts;
}

export interface EventCounts {
  registrants: number;
  attendees: number;
  committees: number;
}

// ─── Kalender ────────────────────────────────────────────

export interface CalendarEvent {
  id: number;
  title: string;
  starts_at: string;
  ends_at: string | null;
  room_id?: string | null;
  room_name?: string | null;
  ukm_id: string;
  ukm_name: string;
  status: EventStatus;
  color_token: BadgeVariant;
}

// ─── Bentrok ─────────────────────────────────────────────

export type ConflictType = "schedule" | "room";

export interface ConflictItem {
  type: ConflictType;
  event_id: number;
  event_title: string;
  starts_at: string;
  ends_at: string | null;
  room_name?: string;
  message: string;
}

export interface ConflictCheckRequest {
  starts_at: string;
  ends_at: string | null;
  room_id?: string | null;
  ukm_id: string;
  exclude_event_id?: number;
}

export interface ConflictCheckResult {
  has_conflict: boolean;
  conflicts: ConflictItem[];
}

// ─── Kepanitiaan ─────────────────────────────────────────

export interface EventCommittee {
  id: number;
  event_id: number;
  member_id: number;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  division?: string;
  created_at?: string;
}

export interface MahasiswaSearchItem {
  id: number;
  nim: string;
  nama_lengkap: string;
  email: string;
  no_whatsapp?: string;
}

export interface CommitteeCreatePayload {
  event_id: number;
  member_id: number;
  role: string;
  division?: string;
}

// ─── LPJ ─────────────────────────────────────────────────

export interface LPJAttachment {
  id: number;
  filename: string;
  url: string;
  size_kb: number;
  uploaded_at: string;
}

export interface EventLPJ {
  id: number;
  event_id: number;
  summary: string;
  participant_count: number;
  budget_planned: number;
  budget_realized: number;
  attachments: LPJAttachment[];
  status: LPJStatus;
  notes?: string;
  submitted_by?: string;
  reviewed_by?: string;
  submitted_at?: string;
  reviewed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LPJSavePayload {
  summary: string;
  participant_count: number;
  budget_planned: number;
  budget_realized: number;
  submit?: boolean;
}

// ─── Presensi ────────────────────────────────────────────

export interface AttendanceSummary {
  event_id: number;
  total_registrants: number;
  total_attendees: number;
  attendance_rate: number;
  last_scan_at?: string;
}

// ─── Sertifikat Panitia ──────────────────────────────────

export interface CertificateCommitteeConfig {
  template_url?: string;
  name_font_size: number;
  name_x_percent: number;
  name_y_percent: number;
  role_font_size: number;
  role_x_percent: number;
  role_y_percent: number;
  orientation: "portrait" | "landscape";
}

// ─── Ruangan ─────────────────────────────────────────────

export interface Room {
  id: string;
  name: string;
  capacity?: number;
  location?: string;
}

// ─── Query ───────────────────────────────────────────────

export interface EventQuery extends BaseQuery {
  status?: EventStatus;
  visibility?: EventVisibility;
  type?: EventType;
  ukm_id?: string;
  from?: string;
  to?: string;
}

// ─── Create/Update payload ───────────────────────────────

export interface EventCreatePayload {
  title: string;
  description: string;
  starts_at: string;
  ends_at?: string | null;
  location: string;
  room_id?: string | null;
  visibility: EventVisibility;
  type: EventType;
  price?: number;
  penalty_amount?: number;
  max_participants?: number;
  poster?: File | null;
  sponsors?: Array<{
    name: string;
    logo?: File | null;
    logo_url?: string;
  }>;
}

export interface EventUpdatePayload extends Partial<EventCreatePayload> {
  id: number;
}
