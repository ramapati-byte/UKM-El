// lib/theme.ts — Pengelolaan tema light/dark/auto (AdminLTE 4 convention)

export type ThemeMode = "light" | "dark" | "auto";

const STORAGE_KEY = "lte-theme";

/** Baca tema tersimpan di localStorage */
export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem(STORAGE_KEY) as ThemeMode) || "auto";
}

/** Simpan tema ke localStorage */
export function setStoredTheme(mode: ThemeMode): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, mode);
}

/** Terapkan tema ke elemen <html> */
export function applyTheme(mode: ThemeMode): void {
  if (typeof document === "undefined") return;

  const html = document.documentElement;
  if (mode === "auto") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    html.setAttribute("data-bs-theme", prefersDark ? "dark" : "light");
  } else {
    html.setAttribute("data-bs-theme", mode);
  }
}

/** Inisialisasi tema saat pertama kali render */
export function initTheme(): void {
  const mode = getStoredTheme();
  applyTheme(mode);
}

/** Toggle ke mode berikutnya: light → dark → auto → light */
export function toggleTheme(): ThemeMode {
  const current = getStoredTheme();
  const next: ThemeMode =
    current === "light" ? "dark" : current === "dark" ? "auto" : "light";
  setStoredTheme(next);
  applyTheme(next);
  return next;
}

/**
 * Script inline untuk anti-FOUC.
 * Dipanggil di <head> root layout agar tema diterapkan sebelum render.
 */
export const THEME_INIT_SCRIPT = `
(function(){
  try {
    var t = localStorage.getItem("${STORAGE_KEY}") || "auto";
    var d = t === "auto"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : t;
    document.documentElement.setAttribute("data-bs-theme", d);
  } catch(e) {}
})();
`;
