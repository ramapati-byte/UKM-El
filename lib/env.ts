// lib/env.ts — Konfigurasi environment & feature flag
// Tidak mengubah lib/axios.ts; fungsi di sini menjadi sumber kebenaran baru.

/** URL dasar API backend (untuk request axios) */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    if (h === "localhost" || h === "127.0.0.1") {
      return "http://localhost:5000/api";
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "https://api.ukmelrahma.my.id/api";
}

/** URL dasar backend (untuk aset statis seperti /uploads) */
export function getBackendBaseUrl(): string {
  return getApiBaseUrl();
}

// ─── Feature flag ────────────────────────────────────────

/** Apakah memakai mock adapter (default: true selama backend baru belum siap) */
export function isMockEnabled(): boolean {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_USE_MOCKS) {
    return process.env.NEXT_PUBLIC_USE_MOCKS === "true";
  }
  return true; // default mock aktif
}

/** Apakah modul event baru diaktifkan */
export function isEventModuleEnabled(): boolean {
  if (
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_ENABLE_EVENT_MODULE
  ) {
    return process.env.NEXT_PUBLIC_ENABLE_EVENT_MODULE === "true";
  }
  return true; // default aktif
}

/** Apakah multi-tenant diaktifkan */
export function isMultiTenantEnabled(): boolean {
  if (
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_ENABLE_MULTI_TENANT
  ) {
    return process.env.NEXT_PUBLIC_ENABLE_MULTI_TENANT === "true";
  }
  return false; // default nonaktif
}
