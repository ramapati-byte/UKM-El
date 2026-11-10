// types/common.ts — Tipe umum yang dipakai lintas domain

/** Wrapper pagination standar sesuai kontrak backend */
export interface Paginated<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  total_records: number;
  total_pages: number;
  current_page: number;
  limit: number;
}

/** Error standar yang dinormalisasi dari interceptor */
export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

/** Opsi untuk Select/Dropdown */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** Parameter query umum */
export interface BaseQuery {
  search?: string;
  page?: number;
  limit?: number;
}

/** Status badge variant */
export type BadgeVariant =
  | "primary"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "secondary";
