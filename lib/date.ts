// lib/date.ts — Utilitas kalender tanpa dependency eksternal

/** Hari pertama di bulan (local) */
export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** Hari terakhir di bulan (local) */
export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

/** Senin awal minggu (ISO: Senin = 0) */
export function startOfWeek(d: Date): Date {
  const day = d.getDay(); // 0=Minggu
  const diff = day === 0 ? -6 : 1 - day;
  const result = new Date(d);
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/** Minggu akhir minggu */
export function endOfWeek(d: Date): Date {
  const s = startOfWeek(d);
  return addDays(s, 6);
}

/** Tambah n hari */
export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Tambah n bulan */
export function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
}

/** Apakah dua tanggal sama (hari) */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Apakah tanggal termasuk hari ini */
export function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

/** Apakah tanggal di bulan yang sama */
export function isSameMonth(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
  );
}

/**
 * Apakah dua interval waktu overlap
 * [aStart, aEnd) vs [bStart, bEnd)
 */
export function overlaps(
  aStart: Date,
  aEnd: Date | null,
  bStart: Date,
  bEnd: Date | null
): boolean {
  const ae = aEnd ?? new Date(aStart.getTime() + 2 * 60 * 60 * 1000); // default 2 jam
  const be = bEnd ?? new Date(bStart.getTime() + 2 * 60 * 60 * 1000);
  return aStart < be && bStart < ae;
}

/**
 * Matriks bulan: array 6 minggu × 7 hari (Date[6][7])
 * Dimulai dari Senin.
 */
export function monthMatrix(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1);
  const weekStart = startOfWeek(first);
  const matrix: Date[][] = [];

  let current = new Date(weekStart);
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(current));
      current = addDays(current, 1);
    }
    matrix.push(week);
  }
  return matrix;
}

/**
 * Matriks minggu: array 7 hari dari Senin
 */
export function weekMatrix(d: Date): Date[] {
  const s = startOfWeek(d);
  return Array.from({ length: 7 }, (_, i) => addDays(s, i));
}

/** Daftar nama hari pendek (Senin..Minggu) */
export const DAY_NAMES_SHORT = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

/** Daftar nama bulan */
export const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/** Format header bulan: "November 2026" */
export function formatMonthYear(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

/** Rentang jam untuk tampilan kalender minggu (06:00 – 23:00) */
export const CALENDAR_HOURS = Array.from({ length: 18 }, (_, i) => i + 6);
