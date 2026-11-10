// types/member.ts — Tipe domain Keanggotaan (FE-2)

import type { BaseQuery } from "./common";

// ─── Status & Tahap ──────────────────────────────────────

export type MemberStatus = "aktif" | "nonaktif" | "alumni" | "pending";

export type RecruitmentStage =
  | "pendaftaran"
  | "verifikasi"
  | "seleksi"
  | "pengumuman";

export type RecruitmentFormStatus = "draft" | "open" | "closed";

export type ApplicantStatus = "pending" | "lolos" | "gugur";

export type RecruitmentFieldType =
  | "text"
  | "email"
  | "tel"
  | "select"
  | "radio"
  | "textarea"
  | "file";

// ─── Anggota UKM ─────────────────────────────────────────

export interface MemberEntity {
  id: string;
  mahasiswaId: string;
  ukmId: string;
  ukmNama: string;
  ukmLogo?: string;
  nim: string;
  namaLengkap: string;
  email: string;
  noHp?: string;
  fotoUrl?: string;
  prodi?: string;
  status: MemberStatus;
  divisi?: string;
  jabatan?: string;
  periodeGabung: string;
  periodeKeluar?: string;
  kartuAnggotaId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberHistoryItem {
  ukmId: string;
  ukmNama: string;
  ukmLogo?: string;
  jabatan?: string;
  divisi?: string;
  periodeGabung: string;
  periodeKeluar?: string;
  status: MemberStatus;
}

// ─── Kartu Anggota ───────────────────────────────────────

export interface MemberCard {
  id: string;
  memberId: string;
  mahasiswaId: string;
  ukmId: string;
  namaLengkap: string;
  nim: string;
  prodi?: string;
  fotoUrl?: string;
  ukmNama: string;
  ukmLogo?: string;
  jabatan?: string;
  divisi?: string;
  periodeAktif: string;
  qrData: string;
  issuedAt: string;
  validUntil?: string;
}

// ─── Form Recruitment ────────────────────────────────────

export interface RecruitmentField {
  id: string;
  label: string;
  fieldType: RecruitmentFieldType;
  options?: string[];
  isRequired: boolean;
  placeholder?: string;
  urutan: number;
}

export interface RecruitmentForm {
  id: string;
  ukmId: string;
  judul: string;
  deskripsi?: string;
  persyaratan?: string;
  kuota?: number;
  periodeAwal: string;
  periodeAkhir: string;
  status: RecruitmentFormStatus;
  stages: RecruitmentStage[];
  formFields: RecruitmentField[];
  totalPendaftar: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Pendaftar / Applicant ───────────────────────────────

export interface ApplicantAnswer {
  fieldId: string;
  fieldLabel: string;
  value: string;
}

export interface Applicant {
  id: string;
  recruitmentFormId: string;
  mahasiswaId?: string;
  namaLengkap: string;
  email: string;
  noHp?: string;
  nim?: string;
  stage: RecruitmentStage;
  status: ApplicantStatus;
  catatanAdmin?: string;
  submittedAt: string;
  formAnswers: ApplicantAnswer[];
}

// ─── Query / Payload ─────────────────────────────────────

export interface MemberQuery extends BaseQuery {
  status?: MemberStatus | "all";
  divisi?: string;
  prodi?: string;
  ukmId?: string;
}

export interface MemberUpdatePayload {
  status?: MemberStatus;
  jabatan?: string;
  divisi?: string;
  periodeKeluar?: string;
}

export interface RecruitmentFormCreatePayload {
  ukmId: string;
  judul: string;
  deskripsi?: string;
  persyaratan?: string;
  kuota?: number;
  periodeAwal: string;
  periodeAkhir: string;
  status?: RecruitmentFormStatus;
  formFields?: Omit<RecruitmentField, "id">[];
}

export interface RecruitmentFormUpdatePayload
  extends Partial<RecruitmentFormCreatePayload> {
  formFields?: RecruitmentField[];
}

export interface ApplicantQuery extends BaseQuery {
  stage?: RecruitmentStage | "all";
  status?: ApplicantStatus | "all";
}

export interface ApplicantMovePayload {
  stage: RecruitmentStage;
  status: ApplicantStatus;
  catatanAdmin?: string;
}

export interface RecruitmentSubmitPayload {
  namaLengkap: string;
  email: string;
  noHp?: string;
  nim?: string;
  formAnswers: { fieldId: string; value: string }[];
}

export interface MemberStats {
  total: number;
  aktif: number;
  nonaktif: number;
  alumni: number;
  pending: number;
}
