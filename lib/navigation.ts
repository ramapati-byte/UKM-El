// lib/navigation.ts — Definisi menu navigasi per role
// Ikon menggunakan nama class Bootstrap Icons (bi bi-*)

export interface NavItem {
  href: string;
  icon: string; // class Bootstrap Icons, misal "bi-speedometer2"
  label: string;
  permission?: string; // opsional: cek permission sebelum tampilkan
  children?: NavItem[];
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

// ─── Menu Organizer (penyelenggara / ketua UKM) ──────────

export const ORGANIZER_NAV: NavSection[] = [
  {
    section: "MENU UTAMA",
    items: [
      { href: "/organizer/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
    ],
  },
  {
    section: "KEANGGOTAAN",
    items: [
      { href: "/organizer/members",     icon: "bi-people-fill",  label: "Anggota UKM"       },
      { href: "/organizer/recruitment", icon: "bi-person-plus",  label: "Open Recruitment"  },
    ],
  },
  {
    section: "EVENT",
    items: [
      { href: "/organizer/events/calendar", icon: "bi-calendar3", label: "Kalender", permission: "event.view" },
      { href: "/organizer/events", icon: "bi-calendar-event", label: "Kelola Event", permission: "event.view" },
      { href: "/organizer/create-event", icon: "bi-plus-circle", label: "Buat Event", permission: "event.create" },
      { href: "/organizer/pendaftar", icon: "bi-people", label: "Pendaftar", permission: "event.view" },
      { href: "/organizer/tim", icon: "bi-person-badge", label: "Tim Panitia", permission: "event.committee.manage" },
    ],
  },
  {
    section: "SURAT & KEUANGAN",
    items: [
      { href: "/organizer/letters", icon: "bi-envelope", label: "Surat Menyurat", permission: "letter.view" },
      { href: "/organizer/finance", icon: "bi-cash-coin", label: "Keuangan", permission: "finance.view" },
    ],
  },
  {
    section: "INVENTARIS & PROKER",
    items: [
      { href: "/organizer/inventory", icon: "bi-box-seam", label: "Inventaris", permission: "inventory.view" },
      { href: "/organizer/inventory/loans", icon: "bi-journal-bookmark", label: "Peminjaman", permission: "loan.view" },
      { href: "/organizer/programs", icon: "bi-diagram-3", label: "Program Kerja", permission: "program.view" },
    ],
  },
  {
    section: "DOKUMEN & KOMUNIKASI",
    items: [
      { href: "/organizer/documents", icon: "bi-folder", label: "Dokumen", permission: "document.view" },
      { href: "/organizer/announcements", icon: "bi-megaphone", label: "Pengumuman", permission: "announcement.view" },
    ],
  },
  {
    section: "KOMUNIKASI",
    items: [
      { href: "/organizer/diskusi", icon: "bi-chat-dots", label: "Diskusi Kelas" },
    ],
  },
];

// ─── Menu Admin (superadmin) ─────────────────────────────

export const ADMIN_NAV: NavSection[] = [
  {
    section: "MENU UTAMA",
    items: [
      { href: "/admin/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
    ],
  },
  {
    section: "MANAJEMEN UKM",
    items: [
      { href: "/admin/ukm", icon: "bi-building", label: "Manajemen UKM", permission: "ukm.view" },
      { href: "/admin/roles", icon: "bi-shield-check", label: "Roles & Permission", permission: "role.view" },
      { href: "/admin/audit", icon: "bi-journal-text", label: "Audit Log", permission: "audit.view" },
    ],
  },
  {
    section: "MANAJEMEN",
    items: [
      { href: "/admin/events", icon: "bi-calendar-check", label: "Persetujuan Event", permission: "event.approve" },
      { href: "/admin/mahasiswa", icon: "bi-mortarboard", label: "Mahasiswa" },
      { href: "/admin/users", icon: "bi-people-fill", label: "Pengguna" },
    ],
  },
  {
    section: "LAPORAN",
    items: [
      { href: "/admin/ranking", icon: "bi-trophy", label: "Peringkat UKM", permission: "ranking.view" },
    ],
  },
];

// ─── Menu Mahasiswa ──────────────────────────────────────

export const MAHASISWA_NAV: NavSection[] = [
  {
    section: "MENU UTAMA",
    items: [
      { href: "/mahasiswa/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
      { href: "/mahasiswa/katalog", icon: "bi-grid-3x3-gap", label: "Katalog Event" },
    ],
  },
  {
    section: "AKTIVITAS",
    items: [
      { href: "/mahasiswa/tiket", icon: "bi-activity", label: "Aktivitas" },
    ],
  },
  {
    section: "KEANGGOTAAN",
    items: [
      { href: "/mahasiswa/kartu-anggota", icon: "bi-credit-card-2-front", label: "Kartu Anggota" },
    ],
  },
  {
    section: "AKUN",
    items: [
      { href: "/mahasiswa/profil", icon: "bi-person", label: "Profil Saya" },
    ],
  },
];

/** Ambil navigasi berdasarkan role */
export function getNavByRole(role: string): NavSection[] {
  switch (role) {
    case "superadmin":
      return ADMIN_NAV;
    case "penyelenggara":
      return ORGANIZER_NAV;
    case "mahasiswa":
      return MAHASISWA_NAV;
    default:
      return [];
  }
}
