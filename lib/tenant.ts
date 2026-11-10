// lib/tenant.ts — Helper multi-tenant (ukm_id, ukm_slug)

// Daftar UKM default yang tersedia di sistem
// TODO: Bisa dimuat dari API atau konfigurasi di production
export const DEFAULT_UKMS = [
  {
    id: "bem-el-rahma",
    slug: "bem-el-rahma",
    name: "BEM El Rahma",
    shortName: "BEM El Rahma",
    color: "indigo",
    description: "Badan Eksekutif Mahasiswa El Rahma",
  },
  {
    id: "ukm-robotik",
    slug: "ukm-robotik",
    name: "UKM Robotik & Otomasi",
    shortName: "UKM Robotik",
    color: "gray",
    description: "Unit Kerja Mahasiswa Robotik & Otomasi",
  },
  {
    id: "ukm-seni",
    slug: "ukm-seni",
    name: "UKM Seni Tradisional",
    shortName: "UKM Seni",
    color: "amber",
    description: "Unit Kerja Mahasiswa Seni Tradisional",
  },
  {
    id: "ukm-teknologi",
    slug: "ukm-teknologi",
    name: "UKM Teknologi",
    shortName: "UKM Teknologi",
    color: "green",
    description: "Unit Kerja Mahasiswa Teknologi",
  },
] as const;

/** Dapatkan daftar UKM default */
export function getDefaultUkms(): typeof DEFAULT_UKMS {
  return DEFAULT_UKMS;
}

/** Dapatkan UKM berdasarkan ID */
export function getUkById(id: string): (typeof DEFAULT_UKMS)[number] | undefined {
  return DEFAULT_UKMS.find((ukm) => ukm.id === id);
}

/** Dapatkan UKM berdasarkan slug */
export function getUkBySlug(slug: string): (typeof DEFAULT_UKMS)[number] | undefined {
  return DEFAULT_UKMS.find((ukm) => ukm.slug === slug);
}

/** Dapatkan nama UKM dari ID */
export function getUkName(id: string): string {
  const ukm = getUkById(id);
  return ukm?.name || id;
}

/** Dapatkan warna UKM dari ID */
export function getUkColor(id: string): string {
  const ukm = getUkById(id);
  return ukm?.color || "gray";
}

/** Ambil UKM aktif dari localStorage */
export function getActiveUkId(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("active_ukm_id");
  }
  return null;
}

/** Simpan UKM aktif ke localStorage */
export function setActiveUkId(ukmId: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("active_ukm_id", ukmId);
  }
}

/** Ambil slug UKM aktif */
export function getActiveUkSlug(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("active_ukm_slug");
  }
  return null;
}

/** Simpan slug UKM aktif */
export function setActiveUkSlug(slug: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("active_ukm_slug", slug);
  }
}

/** Hapus konteks UKM (kembali ke default) */
export function clearActiveUk(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("active_ukm_id");
    localStorage.removeItem("active_ukm_slug");
  }
}

/** Cek apakah multi-tenant diaktifkan */
export function isMultiTenantEnabled(): boolean {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_ENABLE_MULTI_TENANT) {
    return process.env.NEXT_PUBLIC_ENABLE_MULTI_TENANT === "true";
  }
  return false;
}

/** Cek apakah UKM tertentu yang aktif */
export function isUkActive(ukmId: string): boolean {
  return getActiveUkId() === ukmId;
}

/** Get active UKM with fallback to first default */
export function getActiveUkOrDefault(): (typeof DEFAULT_UKMS)[number] {
  const activeId = getActiveUkId();
  if (activeId) {
    const ukm = getUkById(activeId);
    if (ukm) return ukm;
  }
  // Fallback ke UKM pertama
 return DEFAULT_UKMS[0];
}