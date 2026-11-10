// lib/format.ts — Utilitas format Rupiah & tanggal bahasa Indonesia

const IDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Format angka ke Rupiah: Rp50.000 */
export function formatRupiah(amount: number): string {
  return IDR.format(amount);
}

/** Format angka ke ribuan: 50.000 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("id-ID").format(n);
}

// ─── Tanggal ─────────────────────────────────────────────

const DATE_LONG = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const DATE_SHORT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const TIME_SHORT = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const DATE_TIME = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** 2 November 2026 */
export function formatDateLong(date: string | Date): string {
  return DATE_LONG.format(new Date(date));
}

/** 2 Nov 2026 */
export function formatDateShort(date: string | Date): string {
  return DATE_SHORT.format(new Date(date));
}

/** 14:30 WIB */
export function formatTime(date: string | Date): string {
  return TIME_SHORT.format(new Date(date)) + " WIB";
}

/** 2 Nov 2026 14:30 */
export function formatDateTime(date: string | Date): string {
  return DATE_TIME.format(new Date(date));
}

/** Hitung selisih hari dari sekarang (positif = masa depan) */
export function daysFromNow(date: string | Date): number {
  const d = new Date(date);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** "3 hari lagi" / "2 hari yang lalu" */
export function relativeDate(date: string | Date): string {
  const days = daysFromNow(date);
  if (days === 0) return "Hari ini";
  if (days === 1) return "Besok";
  if (days === -1) return "Kemarin";
  if (days > 0) return `${days} hari lagi`;
  return `${Math.abs(days)} hari yang lalu`;
}
