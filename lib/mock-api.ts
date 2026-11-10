// lib/mock-api.ts — Adapter axios berbasis data dummy (tanpa database)

import type { AxiosAdapter, AxiosRequestConfig } from "axios";
import { getActiveUkId, getActiveUkOrDefault, isMultiTenantEnabled, getUkById } from "./tenant";

type Row = Record<string, unknown>;
type Method = "get" | "post" | "put" | "patch" | "delete";

interface MockResult {
  data: unknown;
  status?: number;
}

const ok = (data: unknown, status = 200): MockResult => ({ data, status });

const T = "2026-11-03T09:00:00";
const tomorrow = "2026-11-10T08:30:00";

// Helper untuk filter data berdasarkan UKM dari header request
const getUkFromConfig = (config: AxiosRequestConfig): string | null => {
  try {
    const ukHeader = config.headers["x-ukm-id"] || config.headers["X-UKM-ID"];
    return ukHeader || null;
  } catch {
    return null;
  }
};

// ─── Data master dummy ───────────────────────────────────

const EVENTS: Row[] = [
  {
    id: 1,
    penyelenggara_id: 2,
    judul: "Seminar Nasional Kepemimpinan Mahasiswa 2026",
    visibilitas: "public",
    deskripsi:
      "Seminar tahunan untuk membangun karakter kepemimpinan adaptif di era digital bagi seluruh mahasiswa.",
    poster: null,
    tanggal_waktu: "2026-11-10T08:30:00",
    jam_selesai: "2026-11-10T15:00:00",
    lokasi: "Auditorium Utama",
    tipe_event: "gratis",
    harga: 0,
    nominal_denda: 15000,
    sertifikat_template: "sertifikat-seminar.jpg",
    sertifikat_prefix: "SEM",
    sertifikat_custom_type: "global",
    status: "approved",
    maksimal_peserta: 250,
    is_kuesioner_active: 1,
    is_diskusi_active: 1,
    nama_penyelenggara: "BEM El Rahma",
    ukm_penyelenggara: "BEM El Rahma",
    jumlah_pendaftar: 185,
    jumlah_hadir: 142,
    total_registrants: 185,
    created_at: "2026-10-15T10:00:00",
  },
  {
    id: 2,
    penyelenggara_id: 2,
    judul: "Workshop IoT & Microcontroller Arduino",
    visibilitas: "public",
    deskripsi:
      "Pelatihan praktis pemrograman mikrokontroler dan perakitan sensor IoT dari nol sampai proyek jadi.",
    poster: null,
    tanggal_waktu: "2026-11-15T09:00:00",
    jam_selesai: "2026-11-15T16:00:00",
    lokasi: "Lab Komputer 1",
    tipe_event: "berbayar",
    harga: 50000,
    nominal_denda: 0,
    sertifikat_template: null,
    sertifikat_custom_type: "none",
    status: "approved",
    maksimal_peserta: 35,
    is_kuesioner_active: 0,
    is_diskusi_active: 1,
    nama_penyelenggara: "UKM Robotik & Otomasi",
    ukm_penyelenggara: "UKM Robotik & Otomasi",
    jumlah_pendaftar: 30,
    jumlah_hadir: 0,
    total_registrants: 30,
    created_at: "2026-10-20T11:00:00",
  },
  {
    id: 3,
    penyelenggara_id: 2,
    judul: "Gelar Budaya Nusantara & Malam Keakraban",
    visibilitas: "public",
    deskripsi:
      "Pentas tari tradisional daerah dan peragaan busana adat Nusantara oleh delegasi fakultas.",
    poster: null,
    tanggal_waktu: "2026-11-21T18:30:00",
    jam_selesai: "2026-11-21T22:00:00",
    lokasi: "Aula Kemahasiswaan",
    tipe_event: "gratis",
    harga: 0,
    nominal_denda: 0,
    sertifikat_template: "sertifikat-budaya.jpg",
    sertifikat_custom_type: "none",
    status: "approved",
    maksimal_peserta: 120,
    is_kuesioner_active: 0,
    is_diskusi_active: 1,
    nama_penyelenggara: "UKM Seni Tradisional",
    ukm_penyelenggara: "UKM Seni Tradisional",
    jumlah_pendaftar: 95,
    jumlah_hadir: 0,
    total_registrants: 95,
    created_at: "2026-10-22T14:00:00",
  },
  {
    id: 4,
    penyelenggara_id: 2,
    judul: "Rapat Kerja Wilayah & Sidang Evaluasi BEM",
    visibilitas: "internal",
    deskripsi:
      "Konsolidasi internal kepengurusan BEM bersama seluruh pengurus divisi untuk menyusun evaluasi program kerja.",
    poster: null,
    tanggal_waktu: "2026-11-25T13:00:00",
    jam_selesai: "2026-11-25T17:30:00",
    lokasi: "Ruang Seminar Gedung B",
    tipe_event: "gratis",
    harga: 0,
    nominal_denda: 25000,
    sertifikat_template: null,
    sertifikat_custom_type: "none",
    status: "approved",
    maksimal_peserta: 60,
    is_kuesioner_active: 0,
    is_diskusi_active: 1,
    nama_penyelenggara: "BEM El Rahma",
    ukm_penyelenggara: "BEM El Rahma",
    jumlah_pendaftar: 45,
    jumlah_hadir: 0,
    total_registrants: 45,
    created_at: "2026-10-25T09:00:00",
  },
  {
    id: 5,
    penyelenggara_id: 2,
    judul: "Bakti Sosial & Desa Binaan Kampus",
    visibilitas: "public",
    deskripsi:
      "Penyaluran bantuan sosial, cek kesehatan gratis, dan mengajar di desa binaan bersama mahasiswa relawan.",
    poster: null,
    tanggal_waktu: "2026-11-28T07:00:00",
    jam_selesai: "2026-11-28T16:00:00",
    lokasi: "Desa Sukamaju, Kab. Bogor",
    tipe_event: "gratis",
    harga: 0,
    nominal_denda: 0,
    sertifikat_template: null,
    sertifikat_custom_type: "none",
    status: "pending",
    maksimal_peserta: 50,
    is_kuesioner_active: 0,
    is_diskusi_active: 1,
    nama_penyelenggara: "BEM El Rahma",
    ukm_penyelenggara: "BEM El Rahma",
    jumlah_pendaftar: 18,
    jumlah_hadir: 0,
    total_registrants: 18,
    created_at: "2026-10-28T16:00:00",
  },
  {
    id: 6,
    penyelenggara_id: 2,
    judul: "Latihan Bareng Persiapan Kontes Robot",
    visibilitas: "internal",
    deskripsi:
      "Sesi simulasi track line follower dan uji ketahanan baterai untuk tim inti kontes.",
    poster: null,
    tanggal_waktu: "2026-11-05T15:00:00",
    jam_selesai: "2026-11-05T18:00:00",
    lokasi: "Lab Komputer 1",
    tipe_event: "gratis",
    harga: 0,
    nominal_denda: 0,
    sertifikat_template: "sertifikat-robot.jpg",
    sertifikat_custom_type: "none",
    status: "completed",
    maksimal_peserta: 20,
    is_kuesioner_active: 1,
    is_diskusi_active: 1,
    nama_penyelenggara: "UKM Robotik & Otomasi",
    ukm_penyelenggara: "UKM Robotik & Otomasi",
    jumlah_pendaftar: 16,
    jumlah_hadir: 15,
    total_registrants: 16,
    created_at: "2026-10-01T10:00:00",
  },
  {
    id: 7,
    penyelenggara_id: 2,
    judul: "Pelatihan Public Speaking & Debat Mahasiswa",
    visibilitas: "public",
    deskripsi: "Workshop peningkatan kepercayaan diri dan teknik retorika debat parlemen.",
    poster: null,
    tanggal_waktu: "2026-12-02T09:00:00",
    jam_selesai: "2026-12-02T13:00:00",
    lokasi: "Ruang Seminar Gedung B",
    tipe_event: "gratis",
    harga: 0,
    nominal_denda: 10000,
    sertifikat_template: null,
    sertifikat_custom_type: "none",
    status: "draft",
    maksimal_peserta: 70,
    is_kuesioner_active: 0,
    is_diskusi_active: 1,
    nama_penyelenggara: "BEM El Rahma",
    ukm_penyelenggara: "BEM El Rahma",
    jumlah_pendaftar: 0,
    jumlah_hadir: 0,
    total_registrants: 0,
    created_at: "2026-10-29T10:00:00",
  },
];

const STUDENTS: Row[] = [
  { id: 1, nim: "20240101", nama_lengkap: "Ahmad Fauzi", email: "ahmad.fauzi@elrahma.ac.id", no_hp_mahasiswa: "081234567801", no_whatsapp: "081234567801", jenis_kelamin: "Laki-laki", prodi: "Teknik Informatika", status: "active", foto_mahasiswa: null, google_id: null },
  { id: 2, nim: "20240102", nama_lengkap: "Siti Rahmawati", email: "siti.rahmawati@elrahma.ac.id", no_hp_mahasiswa: "081234567802", no_whatsapp: "081234567802", jenis_kelamin: "Perempuan", prodi: "Sistem Informasi", status: "active", foto_mahasiswa: null, google_id: null },
  { id: 3, nim: "20240103", nama_lengkap: "Budi Santoso", email: "budi.santoso@elrahma.ac.id", no_hp_mahasiswa: "081234567803", no_whatsapp: "081234567803", jenis_kelamin: "Laki-laki", prodi: "Teknik Elektro", status: "active", foto_mahasiswa: null, google_id: null },
  { id: 4, nim: "20240104", nama_lengkap: "Rina Kusuma", email: "rina.kusuma@elrahma.ac.id", no_hp_mahasiswa: "081234567804", no_whatsapp: "081234567804", jenis_kelamin: "Perempuan", prodi: "Manajemen", status: "active", foto_mahasiswa: null, google_id: null },
  { id: 5, nim: "20240105", nama_lengkap: "Dimas Pratama", email: "dimas.pratama@elrahma.ac.id", no_hp_mahasiswa: "081234567805", no_whatsapp: "081234567805", jenis_kelamin: "Laki-laki", prodi: "Teknik Mesin", status: "active", foto_mahasiswa: null, google_id: null },
  { id: 6, nim: "20240106", nama_lengkap: "Indah Permata", email: "indah.permata@elrahma.ac.id", no_hp_mahasiswa: "081234567806", no_whatsapp: "081234567806", jenis_kelamin: "Perempuan", prodi: "Psikologi", status: "active", foto_mahasiswa: null, google_id: null },
  { id: 7, nim: "20240107", nama_lengkap: "Muhammad Rizky", email: "muhammad.rizky@elrahma.ac.id", no_hp_mahasiswa: "081234567807", no_whatsapp: "081234567807", jenis_kelamin: "Laki-laki", prodi: "Teknik Informatika", status: "active", foto_mahasiswa: null, google_id: null },
];

const USERS: Row[] = [
  { id: 1, nama_lengkap: "Super Admin", email: "superadmin@elrahma.ac.id", no_whatsapp: "081200000001", jenis_kelamin: "Laki-laki", role: "superadmin", status: "active", ukm: "", jenis: "admin" },
  { id: 2, nama_lengkap: "BEM El Rahma", email: "bem@elrahma.ac.id", no_whatsapp: "081200000002", jenis_kelamin: "Laki-laki", role: "penyelenggara", status: "active", ukm: "BEM El Rahma" },
  { id: 3, nama_lengkap: "UKM Robotik & Otomasi", email: "robotik@elrahma.ac.id", no_whatsapp: "081200000003", jenis_kelamin: "Laki-laki", role: "penyelenggara", status: "active", ukm: "UKM Robotik" },
  { id: 4, nama_lengkap: "UKM Seni Tradisional", email: "seni@elrahma.ac.id", no_whatsapp: "081200000004", jenis_kelamin: "Perempuan", role: "penyelenggara", status: "active", ukm: "UKM Seni" },
];

const COMMITTEES: Row[] = [
  { id: 1, mahasiswa_id: 1, workshop_id: 1, role: "Ketua Pelaksana", nama_lengkap: "Ahmad Fauzi", no_whatsapp: "081234567801", event_name: "Seminar Nasional Kepemimpinan Mahasiswa 2026" },
  { id: 2, mahasiswa_id: 2, workshop_id: 1, role: "Sekretaris", nama_lengkap: "Siti Rahmawati", no_whatsapp: "081234567802", event_name: "Seminar Nasional Kepemimpinan Mahasiswa 2026" },
  { id: 3, mahasiswa_id: 3, workshop_id: 2, role: "Koordinator Acara", nama_lengkap: "Budi Santoso", no_whatsapp: "081234567803", event_name: "Workshop IoT & Microcontroller Arduino" },
];

function pendaftarFor(eventId: number): Row[] {
  const ev = EVENTS.find((e) => e.id === eventId);
  const count = Math.min(Number(ev?.jumlah_pendaftar ?? 3), 6);
  return STUDENTS.slice(0, Math.max(count, 3)).map((s, i) => ({
    id: eventId * 100 + i + 1,
    workshop_id: eventId,
    mahasiswa_id: s.id,
    nama_peserta: String(s.nama_lengkap),
    nim: s.nim,
    email_peserta: s.email,
    telepon_peserta: s.no_hp_mahasiswa,
    jenis_kelamin: s.jenis_kelamin,
    kode_unik: `TKT-${eventId}${String(i + 1).padStart(3, "0")}`,
    status_pembayaran: Number(ev?.harga ?? 0) > 0 ? (i % 2 === 0 ? "paid" : "pending") : "free",
    status_kehadiran: i < 2 ? "hadir" : "absen",
    sertifikat_status: i < 2 ? "terkirim" : "belum_dikirim",
    sertifikat_nomor: `SEM/${eventId}/${String(i + 1).padStart(3, "0")}`,
    sertifikat_predikat: i === 0 ? "Terbaik" : "",
    status_denda: "aman",
    created_at: T,
  }));
}

const TICKETS: Row[] = [
  { ...pendaftarFor(1)[0], judul: EVENTS[0].judul, poster: null, tanggal_waktu: EVENTS[0].tanggal_waktu, lokasi: EVENTS[0].lokasi, harga: 0, tipe_event: "gratis" },
  { ...pendaftarFor(2)[0], judul: EVENTS[1].judul, poster: null, tanggal_waktu: EVENTS[1].tanggal_waktu, lokasi: EVENTS[1].lokasi, harga: 50000, tipe_event: "berbayar" },
  { ...pendaftarFor(6)[0], judul: EVENTS[5].judul, poster: null, tanggal_waktu: EVENTS[5].tanggal_waktu, lokasi: EVENTS[5].lokasi, harga: 0, tipe_event: "gratis" },
];

const TRANSACTIONS: Row[] = TICKETS.map((t, i) => ({
  ...t,
  id: i + 1,
  created_at: i === 0 ? "2026-10-30T10:00:00" : "2026-10-28T14:00:00",
}));

const FORM_FIELDS: Row[] = [
  { id: 1, workshop_id: 1, label: "Ukuran Kaos", field_type: "select", options: "S,M,L,XL,XXL", is_required: 1, placeholder: "Pilih ukuran", urutan: 1 },
  { id: 2, workshop_id: 1, label: "Alergi Makanan", field_type: "text", options: "", is_required: 0, placeholder: "Contoh: seafood", urutan: 2 },
  { id: 3, workshop_id: 1, label: "Motivasi Mengikuti Event", field_type: "textarea", options: "", is_required: 1, placeholder: "Tulis motivasi Anda", urutan: 3 },
];

const QUESTIONS: Row[] = [
  { id: 1, workshop_id: 1, question_text: "Bagaimana kualitas materi seminar?", question_type: "rating", options: "", is_required: 1 },
  { id: 2, workshop_id: 1, question_text: "Apa masukan untuk event berikutnya?", question_type: "textarea", options: "", is_required: 0 },
  { id: 3, workshop_id: 1, question_text: "Apakah Anda merekomendasikan event ini?", question_type: "radio", options: "Ya,Tidak", is_required: 1 },
  { id: 4, workshop_id: 1, question_text: "Pilih topik favorit", question_type: "dropdown", options: "Kepemimpinan,Public Speaking,Manajemen Organisasi", is_required: 0 },
];

const MATERIALS: Row[] = [
  { id: 1, workshop_id: 1, judul_materi: "Slide Materi Kepemimpinan", deskripsi: "Materi presentasi pembicara utama.", nama_file: "materi-kepemimpinan.pdf", uploaded_at: T },
  { id: 2, workshop_id: 1, judul_materi: "Modul Latihan", deskripsi: "Lembar kerja peserta seminar.", nama_file: "modul-latihan.pdf", uploaded_at: T },
  { id: 3, workshop_id: 2, judul_materi: "Panduan Arduino", deskripsi: "Referensi wiring dan kode dasar.", nama_file: "panduan-arduino.pdf", uploaded_at: T },
];

const MESSAGES: Row[] = [
  { id: 1, workshop_id: 1, user_id: 2, user_type: "admin", message: "Selamat datang di forum diskusi Seminar Kepemimpinan!", nama_pengirim: "BEM El Rahma", created_at: "2026-10-30T09:00:00" },
  { id: 2, workshop_id: 1, user_id: 1, user_type: "mahasiswa", message: "Terima kasih, materi pembuka sangat menarik.", nama_pengirim: "Ahmad Fauzi", created_at: "2026-10-30T09:10:00" },
  { id: 3, workshop_id: 2, user_id: 2, user_type: "admin", message: "Silakan tanyakan kendala instalasi Arduino di sini.", nama_pengirim: "UKM Robotik", created_at: "2026-10-31T13:00:00" },
];

const ADDONS: Row[] = [
  { id: 1, workshop_id: 1, nama_barang: "Kaos Event", deskripsi: "Kaos resmi Seminar Kepemimpinan 2026", harga: 75000, stok: 100, gambar: null, created_at: T },
  { id: 2, workshop_id: 1, nama_barang: "Tumbler Custom", deskripsi: "Tumbler stainless sablon logo event", harga: 50000, stok: 50, gambar: null, created_at: T },
];

const RESULTS: Row[] = [
  {
    participant_name: "Ahmad Fauzi",
    date: "2026-11-01T10:00:00",
    answers: [
      { question: "Bagaimana kualitas materi seminar?", type: "rating", rating: 5, answer: "" },
      { question: "Apa masukan untuk event berikutnya?", type: "textarea", answer: "Tambahkan sesi tanya jawab." },
    ],
  },
  {
    participant_name: "Siti Rahmawati",
    date: "2026-11-01T11:30:00",
    answers: [
      { question: "Bagaimana kualitas materi seminar?", type: "rating", rating: 4, answer: "" },
      { question: "Apakah Anda merekomendasikan event ini?", type: "radio", answer: "Ya" },
    ],
  },
];

const ME = {
  id: 1,
  nim: "20240101",
  nama_lengkap: "Ahmad Fauzi",
  name: "Ahmad Fauzi",
  email: "ahmad.fauzi@elrahma.ac.id",
  no_hp_mahasiswa: "081234567801",
  jenis_kelamin: "Laki-laki",
  prodi: "Teknik Informatika",
  foto_mahasiswa: null,
  role: "mahasiswa",
};

// ─── Utilitas ────────────────────────────────────────────

function parseQuery(config: AxiosRequestConfig): URLSearchParams {
  const raw = typeof config.url === "string" ? config.url : "";
  const qs = raw.split("?")[1] || "";
  return new URLSearchParams(qs);
}

function parseBody(config: AxiosRequestConfig): Row {
  if (!config.data) return {};
  if (typeof config.data === "string") {
    try {
      return JSON.parse(config.data) as Row;
    } catch {
      return {};
    }
  }
  if (config.data instanceof FormData) {
    const obj: Row = {};
    config.data.forEach((v, k) => {
      obj[k] = v;
    });
    return obj;
  }
  return config.data as Row;
}

function normalizePath(config: AxiosRequestConfig): string {
  const raw = typeof config.url === "string" ? config.url : "";
  let path = raw.split("?")[0];
  if (path.startsWith("http")) {
    try {
      path = new URL(raw).pathname;
    } catch {
      /* abaikan */
    }
  }
  if (path.startsWith("/api/")) path = path.slice(4);
  return path.replace(/\/+$/, "") || "/";
}

function match(path: string, pattern: RegExp): RegExpMatchArray | null {
  return path.match(pattern);
}

function eventsPublic(): Row[] {
  return EVENTS.filter((e) => e.visibilitas === "public" && e.status === "approved");
}

function loginUser(body: Row): Row {
  const type = String(body.type || "").toLowerCase();
  const identifier = String(body.identifier || "").toLowerCase();
  if (type === "admin" || identifier.includes("admin")) {
    return { id: 1, name: "Super Admin", nama_lengkap: "Super Admin", email: "superadmin@elrahma.ac.id", role: "superadmin" };
  }
  if (type === "penyelenggara" || identifier.includes("bem") || identifier.includes("ukm")) {
    return { id: 2, name: "BEM El Rahma", nama_lengkap: "BEM El Rahma", email: "bem@elrahma.ac.id", role: "penyelenggara" };
  }
  return { ...ME, name: "Ahmad Fauzi" };
}

// ─── Router request ──────────────────────────────────────

function handle(config: AxiosRequestConfig): MockResult {
  const method = (config.method || "get").toLowerCase() as Method;
  const path = normalizePath(config);
  const query = parseQuery(config);
  const body = parseBody(config);

  // ── Auth ──
  if (path === "/auth/login" || path === "/auth/google") {
    return ok({ token: "demo-token-2026", user: loginUser(body), message: "Login berhasil (mode demo)." });
  }
  if (path.startsWith("/auth/register")) {
    return ok({ message: "Registrasi berhasil (mode demo). Silakan login.", token: "demo-token-2026", user: loginUser(body) });
  }

  // ── Admin ──
  if (path === "/admin/dashboard/stats") {
    return ok({ stats: { active_students: STUDENTS.length, active_organizers: 3, published_events: EVENTS.filter((e) => e.status === "approved").length, pending_events: EVENTS.filter((e) => e.status !== "approved" && e.status !== "rejected").length } });
  }
  if (path === "/admin/users") {
    if (method === "get") return ok(USERS);
    if (method === "post") {
      const item = { id: USERS.length + 1, ...body, status: "active" };
      USERS.push(item);
      return ok({ message: "User ditambahkan (demo).", data: item });
    }
    const m = match(path, /^\/admin\/users\/(\d+)/);
    if (m && method === "put") return ok({ message: "User diperbarui (demo).", ...body });
    if (m && method === "delete") return ok({ message: "User dihapus (demo)." });
  }
  if (path.match(/^\/admin\/users\/\d+\/status$/)) {
    return ok({ message: "Status user diperbarui (demo)." });
  }
  if (path === "/admin/mahasiswa") {
    if (method === "get") return ok(STUDENTS);
    if (method === "post") {
      const item = { id: STUDENTS.length + 1, status: "active", ...body };
      STUDENTS.push(item);
      return ok({ message: "Mahasiswa ditambahkan (demo).", data: item });
    }
  }
  if (path.match(/^\/admin\/mahasiswa\/\d+$/)) {
    if (method === "delete") return ok({ message: "Mahasiswa dihapus (demo)." });
    return ok({ message: "Mahasiswa diperbarui (demo).", ...body });
  }
  if (path.match(/^\/admin\/mahasiswa\/\d+\/status$/)) {
    return ok({ message: "Status mahasiswa diperbarui (demo)." });
  }

  // ── Event (legacy + modul baru) ──
  if (path === "/events" && method === "get") return ok(eventsPublic());
  if (path === "/events" && method === "post") {
    const item = { id: EVENTS.length + 1, status: "pending", ...body, jumlah_pendaftar: 0, jumlah_hadir: 0 };
    EVENTS.unshift(item);
    return ok({ message: "Event dibuat (demo).", data: item });
  }
  if (path === "/events/manage") {
    const search = (query.get("search") || "").toLowerCase();
    const page = Number(query.get("page") || 1);
    const limit = Number(query.get("limit") || 10) || 10;
    const filtered = EVENTS.filter((e) => String(e.judul).toLowerCase().includes(search));
    const start = (page - 1) * limit;
    return ok({
      data: filtered.slice(start, start + limit),
      pagination: {
        current_page: page,
        total_pages: Math.max(1, Math.ceil(filtered.length / limit)),
        total_records: filtered.length,
        total_data: filtered.length,
      },
    });
  }
  if (path === "/events/organizer/stats") {
    return ok({
      stats: {
        active_events: EVENTS.filter((e) => e.status === "approved").length,
        draft_events: EVENTS.filter((e) => e.status === "draft").length,
        tickets_sold: EVENTS.reduce((a, e) => a + Number(e.jumlah_pendaftar || 0), 0),
        estimated_revenue: 1500000,
      },
      recent_events: EVENTS.slice(0, 5),
    });
  }
  if (path.match(/^\/events\/\d+\/status$/)) return ok({ message: "Status event diperbarui (demo)." });
  if (path.match(/^\/events\/\d+\/sertifikat$/)) return ok({ message: "Template sertifikat disimpan (demo)." });
  const eventById = match(path, /^\/events\/(\d+)$/);
  if (eventById) {
    const ev = EVENTS.find((e) => e.id === Number(eventById[1]));
    if (!ev) return ok({ message: "Event tidak ditemukan (demo)." }, 404);
    if (method === "get") return ok(ev);
    if (method === "put") {
      Object.assign(ev, body);
      return ok({ message: "Event diperbarui (demo).", data: ev });
    }
    if (method === "delete") return ok({ message: "Event dihapus (demo)." });
  }

  // ── Mahasiswa ──
  if (path === "/mahasiswa/dashboard") {
    return ok({
      stats: { event_diikuti: TICKETS.length, tiket_aktif: 2, sertifikat: 1 },
      tiket_saya: TICKETS,
      agendas: eventsPublic(),
    });
  }
  if (path === "/mahasiswa/katalog") {
    const q = (query.get("q") || "").toLowerCase();
    const tipe = query.get("tipe") || "all";
    return ok(
      eventsPublic().filter((e) => {
        const byQ = !q || `${e.judul} ${e.lokasi}`.toLowerCase().includes(q);
        const byTipe = tipe === "all" || (tipe === "gratis" ? e.harga === 0 : Number(e.harga) > 0);
        return byQ && byTipe;
      })
    );
  }
  const katalogDetail = match(path, /^\/mahasiswa\/katalog\/(\d+)$/);
  if (katalogDetail) {
    const ev = EVENTS.find((e) => e.id === Number(katalogDetail[1])) || EVENTS[0];
    return ok({
      event: ev,
      is_registered: false,
      sponsors: [{ id: 1, event_id: ev.id, nama_sponsor: "Bank Syariah Kampus", logo: "" }],
      form_fields: FORM_FIELDS.filter((f) => f.workshop_id === ev.id).length
        ? FORM_FIELDS.filter((f) => f.workshop_id === ev.id)
        : FORM_FIELDS,
    });
  }
  if (path.match(/^\/mahasiswa\/katalog\/\d+\/daftar$/)) {
    return ok({ message: "Pendaftaran berhasil disimpan (demo).", payment_url: null });
  }
  if (path === "/mahasiswa/tiket") return ok(TICKETS);
  if (path === "/mahasiswa/transaksi") return ok(TRANSACTIONS);
  if (path === "/mahasiswa/profil") {
    if (method === "get") return ok(ME);
    return ok({ message: "Profil diperbarui (demo).", ...ME, ...body });
  }
  if (path === "/mahasiswa/sertifikat") {
    return ok([
      { pendaftaran_id: 101, workshop_id: 6, judul: EVENTS[5].judul, tanggal_waktu: EVENTS[5].tanggal_waktu, sertifikat_template: EVENTS[5].sertifikat_template, is_kuesioner_active: 1, is_filled: 1 },
      { pendaftaran_id: 102, workshop_id: 1, judul: EVENTS[0].judul, tanggal_waktu: EVENTS[0].tanggal_waktu, sertifikat_template: EVENTS[0].sertifikat_template, is_kuesioner_active: 0, is_filled: 1 },
    ]);
  }
  if (path.match(/^\/mahasiswa\/sertifikat\/\d+\/download$/)) {
    return ok(new Blob([`Sertifikat demo ${new Date().toLocaleString("id-ID")}`], { type: "text/plain" }));
  }
  const kuesionerMahasiswa = match(path, /^\/mahasiswa\/kuesioner\/(\d+)$/);
  if (kuesionerMahasiswa) {
    if (method === "get") {
      return ok({ workshop_id: Number(kuesionerMahasiswa[1]), event_title: EVENTS[0].judul, already_filled: false, questions: QUESTIONS });
    }
    return ok({ message: "Terima kasih, jawaban kuesioner tersimpan (demo)." });
  }
  const materialsMhs = match(path, /^\/mahasiswa\/materials\/(\d+)$/);
  if (materialsMhs) return ok(MATERIALS.filter((m) => m.workshop_id === Number(materialsMhs[1]) || true));
  const diskusiMhs = match(path, /^\/mahasiswa\/diskusi\/(\d+)$/);
  if (diskusiMhs) {
    if (method === "post") {
      MESSAGES.push({ id: MESSAGES.length + 1, workshop_id: Number(diskusiMhs[1]), user_id: 1, user_type: "mahasiswa", message: String(body.message || ""), nama_pengirim: "Ahmad Fauzi", created_at: new Date().toISOString() });
    }
    return ok(MESSAGES.filter((m) => m.workshop_id === Number(diskusiMhs[1])));
  }
  if (path === "/mahasiswa/panitia-events") {
    return ok(EVENTS.slice(0, 3).map((e) => ({ ...e, role: "Panitia", jumlah_pendaftar: e.jumlah_pendaftar, jumlah_hadir: e.jumlah_hadir })));
  }
  const panitiaPendaftar = match(path, /^\/mahasiswa\/panitia-events\/(\d+)\/pendaftar$/);
  if (panitiaPendaftar) return ok(pendaftarFor(Number(panitiaPendaftar[1])));
  if (path.match(/^\/mahasiswa\/panitia-events\/\d+\/pendaftar\/\d+$/)) {
    return ok({ message: "Data pendaftar diperbarui (demo)." });
  }
  if (path.match(/^\/mahasiswa\/panitia-events\/\d+\/pendaftar\/\d+\/status$/)) {
    return ok({ message: "Status pendaftar diperbarui (demo)." });
  }
  if (path.match(/^\/mahasiswa\/panitia-events\/\d+\/scan$/)) {
    return ok({ message: "Presensi berhasil (demo).", peserta: { nama_peserta: "Ahmad Fauzi", status_kehadiran: "hadir" } });
  }

  // ── Organizer: pendaftar ──
  if (path === "/pendaftar") {
    return ok(EVENTS.map((e) => ({ id: e.id, judul: e.judul, poster: e.poster, tanggal_waktu: e.tanggal_waktu, jumlah_pendaftar: e.jumlah_pendaftar, jumlah_hadir: e.jumlah_hadir })));
  }
  const keuangan = match(path, /^\/pendaftar\/(\d+)\/keuangan$/);
  if (keuangan) {
    const ev = EVENTS.find((e) => e.id === Number(keuangan[1])) || EVENTS[0];
    const paid = Number(ev.harga) * 3;
    return ok({
      workshop: ev,
      stats: {
        total_pemasukan_lunas: paid,
        total_pemasukan_belum_lunas: Number(ev.harga) * 2,
        grand_total: paid + Number(ev.harga) * 2,
        total_pendaftaran_lunas: paid,
        total_pendaftaran_belum_lunas: Number(ev.harga) * 2,
        total_denda_lunas: 0,
        total_denda_belum_lunas: Number(ev.nominal_denda),
      },
      records: pendaftarFor(Number(keuangan[1])).map((p, i) => ({
        id: i + 1,
        nama_peserta: p.nama_peserta,
        nim: p.nim,
        email: p.email_peserta,
        tipe: "pendaftaran",
        keterangan: `Tiket ${ev.judul}`,
        nominal: Number(ev.harga),
        status: p.status_pembayaran === "paid" || p.status_pembayaran === "free" ? "lunas" : "belum_lunas",
        tanggal: p.created_at,
      })),
    });
  }
  const pendaftarList = match(path, /^\/pendaftar\/(\d+)$/);
  if (pendaftarList) {
    if (method === "delete") return ok({ message: "Pendaftar dihapus (demo)." });
    return ok(pendaftarFor(Number(pendaftarList[1])));
  }
  if (path.match(/^\/pendaftar\/\d+\/pendaftar\/\d+\/predikat$/)) return ok({ message: "Predikat disimpan (demo)." });
  if (path.match(/^\/pendaftar\/\d+\/scan$/)) {
    return ok({ message: "Scan berhasil (demo).", peserta: { nama_peserta: "Ahmad Fauzi", status_kehadiran: "hadir" } });
  }

  // ── Organizer: tim ──
  if (path === "/tim") {
    if (method === "post") return ok({ message: "Anggota tim ditambahkan (demo)." });
    return ok(COMMITTEES);
  }
  if (path === "/tim/events") return ok(EVENTS.map((e) => ({ id: e.id, judul: e.judul })));
  if (path === "/tim/search") {
    const q = (query.get("q") || "").toLowerCase();
    return ok(STUDENTS.filter((s) => `${s.nama_lengkap} ${s.nim} ${s.email}`.toLowerCase().includes(q)));
  }
  if (path.match(/^\/tim\/\d+$/)) return ok({ message: "Anggota tim dihapus (demo)." });

  // ── Organizer: diskusi & materi ──
  if (path === "/discussion/organizer/events") return ok(EVENTS);
  const discMessages = match(path, /^\/discussion\/messages\/(\d+)$/);
  if (discMessages) {
    if (method === "post") {
      MESSAGES.push({ id: MESSAGES.length + 1, workshop_id: Number(discMessages[1]), user_id: 2, user_type: "admin", message: String(body.message || ""), nama_pengirim: "BEM El Rahma", created_at: new Date().toISOString() });
    }
    return ok(MESSAGES.filter((m) => m.workshop_id === Number(discMessages[1])));
  }
  const discMaterials = match(path, /^\/discussion\/materials\/(\d+)$/);
  if (discMaterials) {
    if (method === "post") return ok({ message: "Materi diunggah (demo)." });
    return ok(MATERIALS.filter((m) => m.workshop_id === Number(discMaterials[1])));
  }
  if (path.match(/^\/discussion\/materials\/\d+$/)) return ok({ message: "Materi dihapus (demo)." });

  // ── Organizer: form ──
  const formDetail = match(path, /^\/form\/(\d+)$/);
  if (formDetail) {
    if (method === "post") return ok({ message: "Field form disimpan (demo).", id: FORM_FIELDS.length + 1 });
    return ok(FORM_FIELDS.filter((f) => f.workshop_id === Number(formDetail[1]) || true));
  }
  if (path.match(/^\/form\/\d+$/)) return ok({ message: "Field form dihapus (demo)." });

  // ── Organizer: kuesioner ──
  const hasilKuesioner = match(path, /^\/kuesioner\/(\d+)\/hasil$/);
  if (hasilKuesioner) return ok(RESULTS);
  if (path.match(/^\/kuesioner\/\d+\/toggle$/)) return ok({ message: "Status kuesioner diubah (demo)." });
  const kuesionerDetail = match(path, /^\/kuesioner\/(\d+)$/);
  if (kuesionerDetail) {
    if (method === "post") return ok({ message: "Pertanyaan kuesioner ditambahkan (demo).", id: QUESTIONS.length + 1 });
    return ok(QUESTIONS.filter((q) => q.workshop_id === Number(kuesionerDetail[1]) || true));
  }
  if (path.match(/^\/kuesioner\/\d+$/)) return ok({ message: "Pertanyaan dihapus (demo)." });

  // ── Organizer: adson ──
  const adsonList = match(path, /^\/adson\/(\d+)$/);
  if (adsonList) {
    if (method === "post") return ok({ message: "Adson ditambahkan (demo).", data: ADDONS[0] });
    return ok(ADDONS.filter((a) => a.workshop_id === Number(adsonList[1]) || true));
  }
  if (path.match(/^\/adson\/\d+$/)) {
    if (method === "delete") return ok({ message: "Adson dihapus (demo)." });
    return ok({ message: "Adson diperbarui (demo)." });
  }

  // ── Fallback aman ──
  if (method === "get") return ok([]);
  return ok({ message: `Aksi demo berhasil (${method.toUpperCase()} ${path}).` });
}

// ─── Adapter axios ───────────────────────────────────────

export const mockApiAdapter: AxiosAdapter = async (config) => {
  const result = handle(config);
  return {
    data: result.data,
    status: result.status ?? 200,
    statusText: "OK",
    headers: {} as never,
    config: config as never,
    request: {},
  };
};

export const MOCK_API_ENABLED = true;
export const MOCK_EXAMPLE_EVENT_TIME = tomorrow;
