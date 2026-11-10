// mocks/event.mock.ts — Data tiruan in-memory untuk modul Event

import type {
  EventEntity,
  CalendarEvent,
  Room,
  EventCommittee,
  EventLPJ,
  AttendanceSummary,
  ConflictCheckRequest,
  ConflictCheckResult,
} from "../types/event";
import { overlaps } from "../lib/date";

// ─── Master Ruangan ──────────────────────────────────────

export const MOCK_ROOMS: Room[] = [
  { id: "room-1", name: "Auditorium Utama", capacity: 300, location: "Gedung Pusat Lt. 3" },
  { id: "room-2", name: "Ruang Seminar Gedung B", capacity: 80, location: "Gedung B Lt. 2" },
  { id: "room-3", name: "Lab Komputer 1", capacity: 40, location: "Gedung C Lt. 1" },
  { id: "room-4", name: "Aula Kemahasiswaan", capacity: 150, location: "Gedung PKM Lt. 1" },
];

// ─── Master UKM (referensi cepat) ────────────────────────

export const MOCK_UKMS = [
  { id: "ukm-bem", slug: "bem", name: "BEM El Rahma" },
  { id: "ukm-robotik", slug: "robotik", name: "UKM Robotik & Otomasi" },
  { id: "ukm-tari", slug: "seni-tari", name: "UKM Seni Tradisional" },
];

// ─── Seed Events ─────────────────────────────────────────

let mockEvents: EventEntity[] = [
  {
    id: 1,
    ukm_id: "ukm-bem",
    ukm_slug: "bem",
    ukm_name: "BEM El Rahma",
    title: "Seminar Nasional Kepemimpinan Mahasiswa 2026",
    slug: "seminar-nasional-kepemimpinan-2026",
    description:
      "Seminar tahunan untuk membangun karakter kepemimpinan adaptif di era digital bagi seluruh mahasiswa.",
    poster_url: null,
    starts_at: "2026-11-10T08:30:00",
    ends_at: "2026-11-10T15:00:00",
    location: "Auditorium Utama",
    room_id: "room-1",
    room_name: "Auditorium Utama",
    visibility: "public",
    type: "free",
    price: 0,
    penalty_amount: 15000,
    max_participants: 250,
    status: "approved",
    is_questionnaire_active: true,
    is_discussion_active: true,
    created_by: 1,
    organizer_name: "BEM El Rahma",
    created_at: "2026-10-15T10:00:00",
    counts: { registrants: 185, attendees: 142, committees: 12 },
    sponsors: [
      { id: 1, event_id: 1, name: "Bank Syariah Kampus", logo_url: "" },
      { id: 2, event_id: 1, name: "Media Mahasiswa", logo_url: "" },
    ],
  },
  {
    id: 2,
    ukm_id: "ukm-robotik",
    ukm_slug: "robotik",
    ukm_name: "UKM Robotik & Otomasi",
    title: "Workshop IoT & Microcontroller Arduino",
    slug: "workshop-iot-arduino",
    description:
      "Pelatihan praktis pemrograman mikrokontroler dan perakitan sensor IoT dari nol sampai proyek jadi.",
    poster_url: null,
    starts_at: "2026-11-15T09:00:00",
    ends_at: "2026-11-15T16:00:00",
    location: "Lab Komputer 1",
    room_id: "room-3",
    room_name: "Lab Komputer 1",
    visibility: "public",
    type: "paid",
    price: 50000,
    penalty_amount: 0,
    max_participants: 35,
    status: "approved",
    is_questionnaire_active: false,
    is_discussion_active: true,
    created_by: 2,
    organizer_name: "UKM Robotik & Otomasi",
    created_at: "2026-10-20T11:00:00",
    counts: { registrants: 30, attendees: 0, committees: 6 },
  },
  {
    id: 3,
    ukm_id: "ukm-tari",
    ukm_slug: "seni-tari",
    ukm_name: "UKM Seni Tradisional",
    title: "Gelar Budaya Nusantara & Malam Keakraban",
    slug: "gelar-budaya-nusantara-2026",
    description:
      "Pentas tari tradisional daerah dan peragaan busana adat Nusantara oleh delegasi fakultas.",
    poster_url: null,
    starts_at: "2026-11-21T18:30:00",
    ends_at: "2026-11-21T22:00:00",
    location: "Aula Kemahasiswaan",
    room_id: "room-4",
    room_name: "Aula Kemahasiswaan",
    visibility: "public",
    type: "free",
    price: 0,
    penalty_amount: 0,
    max_participants: 120,
    status: "approved",
    created_by: 3,
    organizer_name: "UKM Seni Tradisional",
    created_at: "2026-10-22T14:00:00",
    counts: { registrants: 95, attendees: 0, committees: 15 },
  },
  {
    id: 4,
    ukm_id: "ukm-bem",
    ukm_slug: "bem",
    ukm_name: "BEM El Rahma",
    title: "Rapat Kerja Wilayah & Sidang Evaluasi BEM",
    slug: "rakerwil-bem-2026",
    description:
      "Konsolidasi internal kepengurusan BEM bersama seluruh pengurus divisi untuk menyusun evaluasi program kerja.",
    poster_url: null,
    starts_at: "2026-11-25T13:00:00",
    ends_at: "2026-11-25T17:30:00",
    location: "Ruang Seminar Gedung B",
    room_id: "room-2",
    room_name: "Ruang Seminar Gedung B",
    visibility: "internal",
    type: "free",
    price: 0,
    penalty_amount: 25000,
    max_participants: 60,
    status: "approved",
    created_by: 1,
    organizer_name: "BEM El Rahma",
    created_at: "2026-10-25T09:00:00",
    counts: { registrants: 45, attendees: 0, committees: 8 },
  },
  {
    id: 5,
    ukm_id: "ukm-bem",
    ukm_slug: "bem",
    ukm_name: "BEM El Rahma",
    title: "Bakti Sosial & Desa Binaan Kampus",
    slug: "baksos-desa-binaan-2026",
    description:
      "Penyaluran bantuan sosial, cek kesehatan gratis, dan mengajar di desa binaan bersama mahasiswa relawan.",
    poster_url: null,
    starts_at: "2026-11-28T07:00:00",
    ends_at: "2026-11-28T16:00:00",
    location: "Desa Sukamaju, Kab. Bogor",
    room_id: null,
    room_name: null,
    visibility: "public",
    type: "free",
    price: 0,
    penalty_amount: 0,
    max_participants: 50,
    status: "pending",
    created_by: 1,
    organizer_name: "BEM El Rahma",
    created_at: "2026-10-28T16:00:00",
    counts: { registrants: 18, attendees: 0, committees: 10 },
  },
  {
    id: 6,
    ukm_id: "ukm-robotik",
    ukm_slug: "robotik",
    ukm_name: "UKM Robotik & Otomasi",
    title: "Latihan Bareng Persiapan Kontes Robot",
    slug: "latbar-kontes-robot",
    description:
      "Sesi simulasi track line follower dan uji ketahanan baterai untuk tim inti kontes.",
    poster_url: null,
    starts_at: "2026-11-05T15:00:00",
    ends_at: "2026-11-05T18:00:00",
    location: "Lab Komputer 1",
    room_id: "room-3",
    room_name: "Lab Komputer 1",
    visibility: "internal",
    type: "free",
    price: 0,
    penalty_amount: 0,
    max_participants: 20,
    status: "completed",
    created_by: 2,
    organizer_name: "UKM Robotik & Otomasi",
    created_at: "2026-10-01T10:00:00",
    counts: { registrants: 16, attendees: 15, committees: 3 },
  },
  {
    id: 7,
    ukm_id: "ukm-bem",
    ukm_slug: "bem",
    ukm_name: "BEM El Rahma",
    title: "Pelatihan Public Speaking & Debat Mahasiswa",
    slug: "pelatihan-public-speaking-2026",
    description: "Workshop peningkatan kepercayaan diri dan teknik retorika debat parlemen.",
    poster_url: null,
    starts_at: "2026-12-02T09:00:00",
    ends_at: "2026-12-02T13:00:00",
    location: "Ruang Seminar Gedung B",
    room_id: "room-2",
    room_name: "Ruang Seminar Gedung B",
    visibility: "public",
    type: "free",
    price: 0,
    penalty_amount: 10000,
    max_participants: 70,
    status: "draft",
    created_by: 1,
    organizer_name: "BEM El Rahma",
    created_at: "2026-10-29T10:00:00",
    counts: { registrants: 0, attendees: 0, committees: 4 },
  },
];

// ─── Seed Committees ─────────────────────────────────────

let mockCommittees: EventCommittee[] = [
  { id: 1, event_id: 1, member_id: 101, name: "Ahmad Fauzi", role: "Ketua Pelaksana", division: "Inti", email: "fauzi@kampus.ac.id", phone: "08123456789" },
  { id: 2, event_id: 1, member_id: 102, name: "Siti Rahmawati", role: "Sekretaris", division: "Inti", email: "siti@kampus.ac.id", phone: "08123456780" },
  { id: 3, event_id: 1, member_id: 103, name: "Budi Santoso", role: "Bendahara", division: "Inti", email: "budi@kampus.ac.id", phone: "08123456781" },
  { id: 4, event_id: 1, member_id: 104, name: "Rina Kusuma", role: "Koordinator Acara", division: "Acara", email: "rina@kampus.ac.id" },
  { id: 5, event_id: 1, member_id: 105, name: "Dimas Pratama", role: "Koordinator Logistik", division: "Perlengkapan", email: "dimas@kampus.ac.id" },
  { id: 6, event_id: 2, member_id: 201, name: "Eko Prasetyo", role: "Ketua Pelaksana", division: "Inti", email: "eko@kampus.ac.id" },
  { id: 7, event_id: 2, member_id: 202, name: "Dewi Anggraini", role: "Instruktur Workshop", division: "Materi", email: "dewi@kampus.ac.id" },
];

export const MOCK_STUDENTS = [
  { id: 101, nim: "20240101", nama_lengkap: "Ahmad Fauzi", email: "fauzi@kampus.ac.id", no_whatsapp: "08123456789" },
  { id: 102, nim: "20240102", nama_lengkap: "Siti Rahmawati", email: "siti@kampus.ac.id", no_whatsapp: "08123456780" },
  { id: 103, nim: "20240103", nama_lengkap: "Budi Santoso", email: "budi@kampus.ac.id", no_whatsapp: "08123456781" },
  { id: 104, nim: "20240104", nama_lengkap: "Rina Kusuma", email: "rina@kampus.ac.id", no_whatsapp: "08123456782" },
  { id: 105, nim: "20240105", nama_lengkap: "Dimas Pratama", email: "dimas@kampus.ac.id", no_whatsapp: "08123456783" },
  { id: 106, nim: "20240106", nama_lengkap: "Indah Permata", email: "indah@kampus.ac.id", no_whatsapp: "08123456784" },
  { id: 107, nim: "20240107", nama_lengkap: "Muhammad Rizky", email: "rizky@kampus.ac.id", no_whatsapp: "08123456785" },
  { id: 201, nim: "20240201", nama_lengkap: "Eko Prasetyo", email: "eko@kampus.ac.id", no_whatsapp: "08123456786" },
  { id: 202, nim: "20240202", nama_lengkap: "Dewi Anggraini", email: "dewi@kampus.ac.id", no_whatsapp: "08123456787" },
];

export function searchMockStudents(q: string) {
  if (!q || q.length < 2) return [];
  const query = q.toLowerCase();
  return MOCK_STUDENTS.filter(
    (s) =>
      s.nama_lengkap.toLowerCase().includes(query) ||
      s.nim.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query)
  );
}

// ─── Seed LPJ ────────────────────────────────────────────

const mockLPJs: EventLPJ[] = [
  {
    id: 1,
    event_id: 6,
    summary:
      "Latihan bareng persiapan kontes robot telah terlaksana dengan baik. 15 peserta hadir dari 16 pendaftar. Dua robot berhasil menyelesaikan track dengan waktu di bawah 45 detik.",
    participant_count: 15,
    budget_planned: 500000,
    budget_realized: 465000,
    status: "approved",
    notes: "LPJ diterima dan disahkan oleh Kemahasiswaan.",
    submitted_by: "Eko Prasetyo",
    reviewed_by: "BEM / Kemahasiswaan",
    submitted_at: "2026-11-06T10:00:00",
    reviewed_at: "2026-11-07T14:00:00",
    attachments: [
      { id: 1, filename: "Laporan_Keuangan_Latbar.pdf", url: "/uploads/lpj-dummy-1.pdf", size_kb: 450, uploaded_at: "2026-11-06T10:00:00" },
      { id: 2, filename: "Dokumentasi_Foto.jpg", url: "/uploads/lpj-dummy-2.jpg", size_kb: 1200, uploaded_at: "2026-11-06T10:00:00" },
    ],
  },
];

// ─── Helper In-Memory CRUD ───────────────────────────────

export function getMockEvents(): EventEntity[] {
  return [...mockEvents];
}

export function getMockEventById(id: number): EventEntity | undefined {
  return mockEvents.find((e) => e.id === id);
}

export function saveMockEvent(event: Partial<EventEntity> & { title: string }): EventEntity {
  if (event.id) {
    const idx = mockEvents.findIndex((e) => e.id === event.id);
    if (idx !== -1) {
      mockEvents[idx] = {
        ...mockEvents[idx],
        ...event,
        updated_at: new Date().toISOString(),
      };
      return mockEvents[idx];
    }
  }

  const newId = Math.max(...mockEvents.map((e) => e.id), 0) + 1;
  const newEvent: EventEntity = {
    id: newId,
    ukm_id: event.ukm_id || "ukm-bem",
    ukm_slug: event.ukm_slug || "bem",
    ukm_name: event.ukm_name || "BEM El Rahma",
    title: event.title,
    slug: event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: event.description || "",
    poster_url: null,
    starts_at: event.starts_at || new Date().toISOString(),
    ends_at: event.ends_at || null,
    location: event.location || "Kampus",
    room_id: event.room_id || null,
    room_name: MOCK_ROOMS.find((r) => r.id === event.room_id)?.name || null,
    visibility: event.visibility || "public",
    type: event.type || "free",
    price: event.price || 0,
    penalty_amount: event.penalty_amount || 0,
    max_participants: event.max_participants || 0,
    status: event.status || "draft",
    created_by: 1,
    organizer_name: "BEM El Rahma",
    created_at: new Date().toISOString(),
    counts: { registrants: 0, attendees: 0, committees: 0 },
  };

  mockEvents.unshift(newEvent);
  return newEvent;
}

export function deleteMockEvent(id: number): boolean {
  const initial = mockEvents.length;
  mockEvents = mockEvents.filter((e) => e.id !== id);
  return mockEvents.length < initial;
}

export function updateMockEventStatus(id: number, status: EventEntity["status"]): boolean {
  const e = mockEvents.find((x) => x.id === id);
  if (!e) return false;
  e.status = status;
  return true;
}

// ─── Kalender Helper ─────────────────────────────────────

export function getMockCalendarEvents(from?: string, to?: string, ukm_id?: string): CalendarEvent[] {
  let list = mockEvents.filter((e) => e.status !== "rejected" && e.status !== "cancelled");

  if (ukm_id) {
    list = list.filter((e) => e.ukm_id === ukm_id);
  }

  if (from) {
    const fromDate = new Date(from);
    list = list.filter((e) => new Date(e.starts_at) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    list = list.filter((e) => new Date(e.starts_at) <= toDate);
  }

  return list.map((e) => {
    let color: CalendarEvent["color_token"] = "primary";
    if (e.status === "draft") color = "warning";
    else if (e.status === "pending") color = "info";
    else if (e.status === "approved") color = "success";
    else if (e.status === "completed") color = "secondary";

    return {
      id: e.id,
      title: e.title,
      starts_at: e.starts_at,
      ends_at: e.ends_at,
      room_id: e.room_id,
      room_name: e.room_name,
      ukm_id: e.ukm_id,
      ukm_name: e.ukm_name || "UKM",
      status: e.status,
      color_token: color,
    };
  });
}

// ─── Deteksi Bentrok In-Memory ───────────────────────────

export function checkMockConflict(req: ConflictCheckRequest): ConflictCheckResult {
  const newStart = new Date(req.starts_at);
  const newEnd = req.ends_at ? new Date(req.ends_at) : null;
  const conflicts: ConflictCheckResult["conflicts"] = [];

  for (const existing of mockEvents) {
    if (req.exclude_event_id && existing.id === req.exclude_event_id) continue;
    if (existing.status === "rejected" || existing.status === "cancelled") continue;

    const existStart = new Date(existing.starts_at);
    const existEnd = existing.ends_at ? new Date(existing.ends_at) : null;

    if (!overlaps(newStart, newEnd, existStart, existEnd)) continue;

    // 1. Bentrok jadwal pada UKM yang sama
    if (existing.ukm_id === req.ukm_id) {
      conflicts.push({
        type: "schedule",
        event_id: existing.id,
        event_title: existing.title,
        starts_at: existing.starts_at,
        ends_at: existing.ends_at,
        message: `UKM Anda sudah memiliki agenda "${existing.title}" pada rentang waktu yang sama.`,
      });
    }

    // 2. Bentrok ruangan pada ruangan yang sama (lintas UKM)
    if (req.room_id && existing.room_id && req.room_id === existing.room_id) {
      conflicts.push({
        type: "room",
        event_id: existing.id,
        event_title: existing.title,
        starts_at: existing.starts_at,
        ends_at: existing.ends_at,
        room_name: existing.room_name || undefined,
        message: `Ruangan "${existing.room_name || req.room_id}" sedang digunakan oleh "${existing.title}" (${existing.ukm_name}).`,
      });
    }
  }

  return {
    has_conflict: conflicts.length > 0,
    conflicts,
  };
}

// ─── Kepanitiaan Helper ──────────────────────────────────

export function getMockCommittees(eventId: number): EventCommittee[] {
  return mockCommittees.filter((c) => c.event_id === eventId);
}

export function addMockCommittee(payload: {
  event_id: number;
  member_id: number;
  name: string;
  role: string;
  division?: string;
  email?: string;
  phone?: string;
}): EventCommittee {
  const newId = Math.max(...mockCommittees.map((c) => c.id), 0) + 1;
  const item: EventCommittee = {
    id: newId,
    event_id: payload.event_id,
    member_id: payload.member_id,
    name: payload.name,
    role: payload.role,
    division: payload.division || "Umum",
    email: payload.email,
    phone: payload.phone,
    created_at: new Date().toISOString(),
  };
  mockCommittees.push(item);
  return item;
}

export function removeMockCommittee(committeeId: number): boolean {
  const initial = mockCommittees.length;
  mockCommittees = mockCommittees.filter((c) => c.id !== committeeId);
  return mockCommittees.length < initial;
}

// ─── LPJ Helper ──────────────────────────────────────────

export function getMockLPJ(eventId: number): EventLPJ | null {
  return mockLPJs.find((l) => l.event_id === eventId) || null;
}

export function saveMockLPJ(eventId: number, payload: Partial<EventLPJ>): EventLPJ {
  const existing = mockLPJs.find((l) => l.event_id === eventId);
  if (existing) {
    Object.assign(existing, {
      ...payload,
      updated_at: new Date().toISOString(),
    });
    return existing;
  }

  const newId = Math.max(...mockLPJs.map((l) => l.id), 0) + 1;
  const newLPJ: EventLPJ = {
    id: newId,
    event_id: eventId,
    summary: payload.summary || "",
    participant_count: payload.participant_count || 0,
    budget_planned: payload.budget_planned || 0,
    budget_realized: payload.budget_realized || 0,
    attachments: payload.attachments || [],
    status: payload.status || "draft",
    notes: payload.notes,
    submitted_by: payload.submitted_by || "Pengurus UKM",
    submitted_at: payload.status === "submitted" ? new Date().toISOString() : undefined,
    created_at: new Date().toISOString(),
  };
  mockLPJs.push(newLPJ);
  return newLPJ;
}

// ─── Presensi Summary Helper ─────────────────────────────

export function getMockAttendanceSummary(eventId: number): AttendanceSummary {
  const ev = mockEvents.find((e) => e.id === eventId);
  const total = ev?.counts?.registrants || 0;
  const attended = ev?.counts?.attendees || 0;
  return {
    event_id: eventId,
    total_registrants: total,
    total_attendees: attended,
    attendance_rate: total > 0 ? Math.round((attended / total) * 100) : 0,
    last_scan_at: attended > 0 ? "2026-11-10T14:32:00" : undefined,
  };
}
