// lib/theme.ts — Pengelolaan tema light/dark/auto (Modern SaaS convention)

export type ThemeMode = "light" | "dark" | "auto";

const STORAGE_KEY = "app-theme";
const LEGACY_STORAGE_KEY = "lte-theme";

/** Baca tema tersimpan di localStorage */
export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return (
    (localStorage.getItem(STORAGE_KEY) as ThemeMode) ||
    (localStorage.getItem(LEGACY_STORAGE_KEY) as ThemeMode) ||
    "light"
  );
}

/** Simpan tema ke localStorage */
export function setStoredTheme(mode: ThemeMode): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, mode);
  localStorage.setItem(LEGACY_STORAGE_KEY, mode);
}

/** Terapkan tema ke elemen <html> */
export function applyTheme(mode: ThemeMode): void {
  if (typeof document === "undefined") return;

  const html = document.documentElement;
  let resolvedTheme = mode;
  if (mode === "auto") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    resolvedTheme = prefersDark ? "dark" : "light";
  }

  // Terapkan class Tailwind 'dark'
  if (resolvedTheme === "dark") {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }

  // Terapkan atribut data untuk kompatibilitas
  html.setAttribute("data-theme", resolvedTheme);
  html.setAttribute("data-bs-theme", resolvedTheme);
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
    var t = localStorage.getItem("${STORAGE_KEY}") || localStorage.getItem("${LEGACY_STORAGE_KEY}") || "light";
    var d = t === "auto"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : t;
    if (d === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    document.documentElement.setAttribute("data-theme", d);
    document.documentElement.setAttribute("data-bs-theme", d);
  } catch(e) {}
})();
`;
