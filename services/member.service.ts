// services/member.service.ts — Kontrak & adapter keanggotaan (FE-2)

import type { Paginated } from "../types/common";
import type {
  MemberEntity,
  MemberStats,
  MemberQuery,
  MemberUpdatePayload,
  MemberHistoryItem,
  MemberCard,
  RecruitmentForm,
  RecruitmentFormCreatePayload,
  RecruitmentFormUpdatePayload,
  RecruitmentField,
  Applicant,
  ApplicantQuery,
  ApplicantMovePayload,
  RecruitmentSubmitPayload,
} from "../types/member";
import api from "../lib/api";
import { isMockEnabled } from "../lib/env";
import {
  MOCK_MEMBERS,
  MOCK_MEMBER_HISTORY,
  MOCK_MEMBER_CARDS,
  MOCK_RECRUITMENT_FORMS,
  MOCK_APPLICANTS,
} from "../mocks/member.mock";

// ─── Kontrak service ─────────────────────────────────────

export interface MemberService {
  // Anggota
  listMembers(params?: MemberQuery): Promise<Paginated<MemberEntity>>;
  getMemberById(id: string): Promise<MemberEntity>;
  updateMember(id: string, payload: MemberUpdatePayload): Promise<MemberEntity>;
  deleteMember(id: string): Promise<void>;
  getMemberHistory(mahasiswaId: string): Promise<MemberHistoryItem[]>;
  getMemberStats(ukmId?: string): Promise<MemberStats>;

  // Kartu anggota
  getMemberCard(mahasiswaId: string): Promise<MemberCard | null>;

  // Recruitment form
  listRecruitmentForms(ukmId?: string): Promise<RecruitmentForm[]>;
  getRecruitmentFormById(id: string): Promise<RecruitmentForm>;
  createRecruitmentForm(
    payload: RecruitmentFormCreatePayload
  ): Promise<RecruitmentForm>;
  updateRecruitmentForm(
    id: string,
    payload: RecruitmentFormUpdatePayload
  ): Promise<RecruitmentForm>;
  deleteRecruitmentForm(id: string): Promise<void>;
  publishRecruitmentForm(id: string): Promise<RecruitmentForm>;
  closeRecruitmentForm(id: string): Promise<RecruitmentForm>;

  // Field form
  addFormField(
    formId: string,
    field: Omit<RecruitmentField, "id">
  ): Promise<RecruitmentField>;
  updateFormField(
    formId: string,
    fieldId: string,
    field: Partial<RecruitmentField>
  ): Promise<RecruitmentField>;
  deleteFormField(formId: string, fieldId: string): Promise<void>;
  reorderFormFields(formId: string, orderedIds: string[]): Promise<void>;

  // Pendaftar / applicant
  listApplicants(
    formId: string,
    params?: ApplicantQuery
  ): Promise<Paginated<Applicant>>;
  getApplicantById(formId: string, applicantId: string): Promise<Applicant>;
  moveApplicant(
    formId: string,
    applicantId: string,
    payload: ApplicantMovePayload
  ): Promise<Applicant>;

  // Portal mahasiswa
  submitRecruitment(
    formId: string,
    payload: RecruitmentSubmitPayload
  ): Promise<void>;
  getPublicRecruitmentForm(slug: string, formId: string): Promise<RecruitmentForm>;
}

// ─── Mock adapter ────────────────────────────────────────

class MemberMockService implements MemberService {
  private members = [...MOCK_MEMBERS];
  private forms = MOCK_RECRUITMENT_FORMS.map((f) => ({ ...f, formFields: [...f.formFields] }));
  private applicants = [...MOCK_APPLICANTS];

  async listMembers(params?: MemberQuery): Promise<Paginated<MemberEntity>> {
    await delay();
    let result = [...this.members];

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (m) =>
          m.namaLengkap.toLowerCase().includes(q) ||
          m.nim.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
      );
    }
    if (params?.status && params.status !== "all") {
      result = result.filter((m) => m.status === params.status);
    }
    if (params?.divisi) {
      result = result.filter((m) => m.divisi === params.divisi);
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;
    const paged = result.slice(start, start + limit);

    return {
      data: paged,
      pagination: {
        current_page: page,
        total_pages: Math.max(1, Math.ceil(result.length / limit)),
        total_records: result.length,
        limit,
      },
    };
  }

  async getMemberById(id: string): Promise<MemberEntity> {
    await delay();
    const m = this.members.find((x) => x.id === id);
    if (!m) throw new Error("Anggota tidak ditemukan");
    return { ...m };
  }

  async updateMember(id: string, payload: MemberUpdatePayload): Promise<MemberEntity> {
    await delay();
    const idx = this.members.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error("Anggota tidak ditemukan");
    this.members[idx] = {
      ...this.members[idx],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.members[idx] };
  }

  async deleteMember(id: string): Promise<void> {
    await delay();
    this.members = this.members.filter((x) => x.id !== id);
  }

  async getMemberHistory(mahasiswaId: string): Promise<MemberHistoryItem[]> {
    await delay();
    return MOCK_MEMBER_HISTORY[mahasiswaId] ?? [];
  }

  async getMemberStats(_ukmId?: string): Promise<MemberStats> {
    await delay();
    const m = this.members;
    return {
      total: m.length,
      aktif: m.filter((x) => x.status === "aktif").length,
      nonaktif: m.filter((x) => x.status === "nonaktif").length,
      alumni: m.filter((x) => x.status === "alumni").length,
      pending: m.filter((x) => x.status === "pending").length,
    };
  }

  async getMemberCard(mahasiswaId: string): Promise<MemberCard | null> {
    await delay();
    const card = MOCK_MEMBER_CARDS.find((c) => c.mahasiswaId === mahasiswaId);
    if (card) return { ...card };
    // Buat kartu generik dari data anggota
    const member = this.members.find((m) => m.mahasiswaId === mahasiswaId);
    if (!member) return null;
    return {
      id: `card-auto-${mahasiswaId}`,
      memberId: member.id,
      mahasiswaId,
      ukmId: member.ukmId,
      namaLengkap: member.namaLengkap,
      nim: member.nim,
      prodi: member.prodi,
      ukmNama: member.ukmNama,
      jabatan: member.jabatan,
      divisi: member.divisi,
      periodeAktif: `${formatPeriode(member.periodeGabung)} – Sekarang`,
      qrData: `MEMBER:${member.ukmId}:${member.id}:${member.namaLengkap}:${member.nim}`,
      issuedAt: member.createdAt,
    };
  }

  async listRecruitmentForms(ukmId?: string): Promise<RecruitmentForm[]> {
    await delay();
    if (ukmId) return this.forms.filter((f) => f.ukmId === ukmId).map((f) => ({ ...f }));
    return this.forms.map((f) => ({ ...f }));
  }

  async getRecruitmentFormById(id: string): Promise<RecruitmentForm> {
    await delay();
    const f = this.forms.find((x) => x.id === id);
    if (!f) throw new Error("Form rekrutmen tidak ditemukan");
    return { ...f, formFields: [...f.formFields] };
  }

  async createRecruitmentForm(payload: RecruitmentFormCreatePayload): Promise<RecruitmentForm> {
    await delay();
    const newForm: RecruitmentForm = {
      id: `rec-${Date.now()}`,
      ukmId: payload.ukmId,
      judul: payload.judul,
      deskripsi: payload.deskripsi,
      persyaratan: payload.persyaratan,
      kuota: payload.kuota,
      periodeAwal: payload.periodeAwal,
      periodeAkhir: payload.periodeAkhir,
      status: payload.status ?? "draft",
      stages: ["pendaftaran", "verifikasi", "seleksi", "pengumuman"],
      formFields: (payload.formFields ?? []).map((ff, i) => ({
        ...ff,
        id: `ff-new-${i}`,
      })),
      totalPendaftar: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.forms.push(newForm);
    return { ...newForm };
  }

  async updateRecruitmentForm(
    id: string,
    payload: RecruitmentFormUpdatePayload
  ): Promise<RecruitmentForm> {
    await delay();
    const idx = this.forms.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error("Form rekrutmen tidak ditemukan");
    this.forms[idx] = {
      ...this.forms[idx],
      ...payload,
      formFields: payload.formFields ?? this.forms[idx].formFields,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.forms[idx] };
  }

  async deleteRecruitmentForm(id: string): Promise<void> {
    await delay();
    this.forms = this.forms.filter((x) => x.id !== id);
  }

  async publishRecruitmentForm(id: string): Promise<RecruitmentForm> {
    return this.updateRecruitmentForm(id, { status: "open" });
  }

  async closeRecruitmentForm(id: string): Promise<RecruitmentForm> {
    return this.updateRecruitmentForm(id, { status: "closed" });
  }

  async addFormField(formId: string, field: Omit<RecruitmentField, "id">): Promise<RecruitmentField> {
    await delay();
    const form = this.forms.find((f) => f.id === formId);
    if (!form) throw new Error("Form tidak ditemukan");
    const newField: RecruitmentField = { ...field, id: `ff-${Date.now()}` };
    form.formFields.push(newField);
    form.updatedAt = new Date().toISOString();
    return { ...newField };
  }

  async updateFormField(
    formId: string,
    fieldId: string,
    field: Partial<RecruitmentField>
  ): Promise<RecruitmentField> {
    await delay();
    const form = this.forms.find((f) => f.id === formId);
    if (!form) throw new Error("Form tidak ditemukan");
    const idx = form.formFields.findIndex((ff) => ff.id === fieldId);
    if (idx === -1) throw new Error("Field tidak ditemukan");
    form.formFields[idx] = { ...form.formFields[idx], ...field };
    form.updatedAt = new Date().toISOString();
    return { ...form.formFields[idx] };
  }

  async deleteFormField(formId: string, fieldId: string): Promise<void> {
    await delay();
    const form = this.forms.find((f) => f.id === formId);
    if (!form) throw new Error("Form tidak ditemukan");
    form.formFields = form.formFields.filter((ff) => ff.id !== fieldId);
    form.updatedAt = new Date().toISOString();
  }

  async reorderFormFields(formId: string, orderedIds: string[]): Promise<void> {
    await delay();
    const form = this.forms.find((f) => f.id === formId);
    if (!form) throw new Error("Form tidak ditemukan");
    const fieldMap = new Map(form.formFields.map((ff) => [ff.id, ff]));
    form.formFields = orderedIds
      .map((id, i) => {
        const ff = fieldMap.get(id);
        return ff ? { ...ff, urutan: i + 1 } : null;
      })
      .filter(Boolean) as RecruitmentField[];
    form.updatedAt = new Date().toISOString();
  }

  async listApplicants(
    formId: string,
    params?: ApplicantQuery
  ): Promise<Paginated<Applicant>> {
    await delay();
    let result = this.applicants.filter((a) => a.recruitmentFormId === formId);

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.namaLengkap.toLowerCase().includes(q) ||
          (a.nim ?? "").toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q)
      );
    }
    if (params?.stage && params.stage !== "all") {
      result = result.filter((a) => a.stage === params.stage);
    }
    if (params?.status && params.status !== "all") {
      result = result.filter((a) => a.status === params.status);
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const start = (page - 1) * limit;

    return {
      data: result.slice(start, start + limit),
      pagination: {
        current_page: page,
        total_pages: Math.max(1, Math.ceil(result.length / limit)),
        total_records: result.length,
        limit,
      },
    };
  }

  async getApplicantById(formId: string, applicantId: string): Promise<Applicant> {
    await delay();
    const a = this.applicants.find(
      (x) => x.recruitmentFormId === formId && x.id === applicantId
    );
    if (!a) throw new Error("Pendaftar tidak ditemukan");
    return { ...a };
  }

  async moveApplicant(
    formId: string,
    applicantId: string,
    payload: ApplicantMovePayload
  ): Promise<Applicant> {
    await delay();
    const idx = this.applicants.findIndex(
      (x) => x.recruitmentFormId === formId && x.id === applicantId
    );
    if (idx === -1) throw new Error("Pendaftar tidak ditemukan");
    this.applicants[idx] = {
      ...this.applicants[idx],
      stage: payload.stage,
      status: payload.status,
      catatanAdmin: payload.catatanAdmin,
    };
    return { ...this.applicants[idx] };
  }

  async submitRecruitment(
    formId: string,
    payload: RecruitmentSubmitPayload
  ): Promise<void> {
    await delay();
    const form = this.forms.find((f) => f.id === formId);
    if (!form) throw new Error("Form tidak ditemukan");
    if (form.status !== "open") throw new Error("Form pendaftaran sudah ditutup");
    const newApplicant: Applicant = {
      id: `app-${Date.now()}`,
      recruitmentFormId: formId,
      namaLengkap: payload.namaLengkap,
      email: payload.email,
      noHp: payload.noHp,
      nim: payload.nim,
      stage: "pendaftaran",
      status: "pending",
      submittedAt: new Date().toISOString(),
      formAnswers: payload.formAnswers.map((fa) => {
        const field = form.formFields.find((ff) => ff.id === fa.fieldId);
        return {
          fieldId: fa.fieldId,
          fieldLabel: field?.label ?? fa.fieldId,
          value: fa.value,
        };
      }),
    };
    this.applicants.push(newApplicant);
    form.totalPendaftar += 1;
  }

  async getPublicRecruitmentForm(
    _slug: string,
    formId: string
  ): Promise<RecruitmentForm> {
    await delay();
    const f = this.forms.find((x) => x.id === formId);
    if (!f) throw new Error("Form rekrutmen tidak ditemukan");
    if (f.status !== "open") throw new Error("Pendaftaran sudah ditutup");
    return { ...f, formFields: [...f.formFields] };
  }
}

// ─── Real adapter ────────────────────────────────────────

interface BackendMemberRow {
  id: number | string;
  mahasiswa_id?: number | string;
  nim?: string;
  nama_lengkap: string;
  email?: string;
  no_hp_mahasiswa?: string;
  prodi?: string;
  foto_mahasiswa?: string;
  status?: string;
  divisi?: string;
  jabatan?: string;
  ukm_nama?: string;
  created_at?: string;
  updated_at?: string;
}

interface BackendRecruitmentRow {
  id: number | string;
  organizer_id?: number | string;
  judul: string;
  deskripsi?: string;
  persyaratan?: string;
  kuota?: number;
  tanggal_buka?: string;
  tanggal_tutup?: string;
  status?: string;
  total_pendaftar?: number;
  created_at?: string;
  updated_at?: string;
}

interface BackendApplicantRow {
  id: number | string;
  recruitment_id?: number | string;
  mahasiswa_id?: number | string;
  nama_lengkap: string;
  email?: string;
  no_hp?: string;
  nim?: string;
  status?: string;
  catatan?: string;
  jawaban?: string | Record<string, unknown>;
  created_at?: string;
}

function mapMemberRow(r: BackendMemberRow): MemberEntity {
  const now = new Date().toISOString();
  const status: MemberEntity["status"] =
    r.status === "aktif" || r.status === "nonaktif" || r.status === "alumni" || r.status === "pending"
      ? r.status
      : "aktif";
  return {
    id: String(r.id),
    mahasiswaId: String(r.mahasiswa_id || r.id),
    ukmId: "ukm-default",
    ukmNama: r.ukm_nama || "UKM Penyelenggara",
    nim: r.nim || "-",
    namaLengkap: r.nama_lengkap,
    email: r.email || "-",
    noHp: r.no_hp_mahasiswa || undefined,
    fotoUrl: r.foto_mahasiswa || undefined,
    prodi: r.prodi || undefined,
    status,
    divisi: r.divisi || "Anggota",
    jabatan: r.jabatan || "Anggota",
    periodeGabung: formatPeriode(r.created_at || now),
    createdAt: r.created_at || now,
    updatedAt: r.updated_at || r.created_at || now,
  };
}

function mapRecruitmentRow(r: BackendRecruitmentRow): RecruitmentForm {
  const now = new Date().toISOString();
  const status: RecruitmentForm["status"] =
    r.status === "open" || r.status === "buka"
      ? "open"
      : r.status === "closed" || r.status === "tutup"
      ? "closed"
      : "draft";
  return {
    id: String(r.id),
    ukmId: r.organizer_id ? String(r.organizer_id) : "ukm-default",
    judul: r.judul,
    deskripsi: r.deskripsi || undefined,
    persyaratan: r.persyaratan || undefined,
    kuota: r.kuota ?? undefined,
    periodeAwal: r.tanggal_buka || r.created_at || now,
    periodeAkhir: r.tanggal_tutup || (r as unknown as { batas_pendaftaran?: string }).batas_pendaftaran || now,
    status,
    stages: ["pendaftaran", "verifikasi", "seleksi", "pengumuman"],
    formFields: [],
    totalPendaftar: r.total_pendaftar ?? (r as unknown as { jumlah_pelamar?: number }).jumlah_pelamar ?? 0,
    createdAt: r.created_at || now,
    updatedAt: r.updated_at || r.created_at || now,
  };
}

function mapApplicantRow(r: BackendApplicantRow, formId: string): Applicant {
  const rawStatus = (r.status || "pending").toLowerCase();
  const status: Applicant["status"] =
    rawStatus === "diterima" || rawStatus === "lolos"
      ? "lolos"
      : rawStatus === "ditolak" || rawStatus === "gugur"
      ? "gugur"
      : "pending";
  const stage: Applicant["stage"] =
    status === "lolos" ? "pengumuman" : status === "gugur" ? "seleksi" : "pendaftaran";
  return {
    id: String(r.id),
    recruitmentFormId: String(r.recruitment_id || formId),
    mahasiswaId: r.mahasiswa_id ? String(r.mahasiswa_id) : undefined,
    namaLengkap: r.nama_lengkap,
    email: r.email || "-",
    noHp: r.no_hp || undefined,
    nim: r.nim || undefined,
    stage,
    status,
    catatanAdmin: r.catatan || undefined,
    submittedAt: r.created_at || new Date().toISOString(),
    formAnswers: [],
  };
}

class MemberRealService implements MemberService {
  async listMembers(params?: MemberQuery): Promise<Paginated<MemberEntity>> {
    const res = await api.get<{ data: BackendMemberRow[] }>("/organizer/members");
    let mapped = (res.data?.data ?? []).map(mapMemberRow);
    if (params?.status && params.status !== "all") {
      mapped = mapped.filter((m) => m.status === params.status);
    }
    if (params?.divisi && params.divisi !== "all") {
      mapped = mapped.filter((m) => m.divisi === params.divisi);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      mapped = mapped.filter(
        (m) =>
          m.namaLengkap.toLowerCase().includes(q) ||
          m.nim.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
      );
    }
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;
    return {
      data: mapped.slice(start, start + limit),
      pagination: {
        total_records: mapped.length,
        total_pages: Math.max(1, Math.ceil(mapped.length / limit)),
        current_page: page,
        limit,
      },
    };
  }

  async getMemberById(id: string): Promise<MemberEntity> {
    const res = await api.get<{ data?: BackendMemberRow } & BackendMemberRow>(`/organizer/members/${id}`);
    return mapMemberRow(res.data?.data || res.data);
  }

  async updateMember(id: string, payload: MemberUpdatePayload): Promise<MemberEntity> {
    const current = await this.getMemberById(id);
    return { ...current, ...payload, updatedAt: new Date().toISOString() };
  }

  async deleteMember(_id: string): Promise<void> {
    return;
  }

  async getMemberHistory(_mahasiswaId: string): Promise<MemberHistoryItem[]> {
    return [];
  }

  async getMemberStats(): Promise<MemberStats> {
    const { data } = await this.listMembers({ limit: 500 });
    return {
      total: data.length,
      aktif: data.filter((m) => m.status === "aktif").length,
      nonaktif: data.filter((m) => m.status === "nonaktif").length,
      alumni: data.filter((m) => m.status === "alumni").length,
      pending: data.filter((m) => m.status === "pending").length,
    };
  }

  async getMemberCard(_mahasiswaId: string): Promise<MemberCard | null> {
    return null;
  }

  async listRecruitmentForms(): Promise<RecruitmentForm[]> {
    const res = await api.get<{ data: BackendRecruitmentRow[] }>("/organizer/recruitment");
    return (res.data?.data ?? []).map(mapRecruitmentRow);
  }

  async getRecruitmentFormById(id: string): Promise<RecruitmentForm> {
    const res = await api.get<{ data?: BackendRecruitmentRow } & BackendRecruitmentRow>(
      `/organizer/recruitment/${id}`
    );
    return mapRecruitmentRow(res.data?.data || res.data);
  }

  async createRecruitmentForm(payload: RecruitmentFormCreatePayload): Promise<RecruitmentForm> {
    const res = await api.post<{ id: number | string }>("/organizer/recruitment", {
      judul: payload.judul,
      deskripsi: payload.deskripsi || null,
      persyaratan: payload.persyaratan || null,
      kuota: payload.kuota ?? null,
      tanggal_buka: payload.periodeAwal,
      tanggal_tutup: payload.periodeAkhir,
      status: payload.status || "open",
    });
    return this.getRecruitmentFormById(String(res.data?.id));
  }

  async updateRecruitmentForm(
    id: string,
    payload: RecruitmentFormUpdatePayload
  ): Promise<RecruitmentForm> {
    const current = await this.getRecruitmentFormById(id);
    return { ...current, ...payload, updatedAt: new Date().toISOString() };
  }

  async deleteRecruitmentForm(id: string): Promise<void> {
    await api.delete(`/organizer/recruitment/${id}`);
  }

  async publishRecruitmentForm(id: string): Promise<RecruitmentForm> {
    return this.updateRecruitmentForm(id, { status: "open" });
  }

  async closeRecruitmentForm(id: string): Promise<RecruitmentForm> {
    return this.updateRecruitmentForm(id, { status: "closed" });
  }

  async addFormField(
    _formId: string,
    field: Omit<RecruitmentField, "id">
  ): Promise<RecruitmentField> {
    return { ...field, id: `field-${Date.now()}` };
  }

  async updateFormField(
    _formId: string,
    fieldId: string,
    field: Partial<RecruitmentField>
  ): Promise<RecruitmentField> {
    return {
      id: fieldId,
      label: field.label || "",
      fieldType: field.fieldType || "text",
      isRequired: field.isRequired ?? false,
      urutan: field.urutan ?? 1,
      ...field,
    };
  }

  async deleteFormField(_formId: string, _fieldId: string): Promise<void> {
    return;
  }

  async reorderFormFields(_formId: string, _orderedIds: string[]): Promise<void> {
    return;
  }

  async listApplicants(formId: string, params?: ApplicantQuery): Promise<Paginated<Applicant>> {
    const res = await api.get<{ applicants?: BackendApplicantRow[]; data?: { applicants?: BackendApplicantRow[] } }>(
      `/organizer/recruitment/${formId}`
    );
    const rawApplicants = res.data?.applicants ?? res.data?.data?.applicants ?? [];
    let mapped = rawApplicants.map((a) => mapApplicantRow(a, formId));
    if (params?.stage && params.stage !== "all") {
      mapped = mapped.filter((a) => a.stage === params.stage);
    }
    if (params?.status && params.status !== "all") {
      mapped = mapped.filter((a) => a.status === params.status);
    }
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;
    return {
      data: mapped.slice(start, start + limit),
      pagination: {
        total_records: mapped.length,
        total_pages: Math.max(1, Math.ceil(mapped.length / limit)),
        current_page: page,
        limit,
      },
    };
  }

  async getApplicantById(formId: string, applicantId: string): Promise<Applicant> {
    const { data } = await this.listApplicants(formId, { limit: 200 });
    const found = data.find((a) => a.id === applicantId);
    if (!found) throw new Error("Pendaftar tidak ditemukan");
    return found;
  }

  async moveApplicant(
    formId: string,
    applicantId: string,
    payload: ApplicantMovePayload
  ): Promise<Applicant> {
    const backendStatus =
      payload.status === "lolos" ? "diterima" : payload.status === "gugur" ? "ditolak" : "pending";
    await api.patch(`/organizer/recruitment/applicants/${applicantId}/status`, {
      status: backendStatus,
      catatan: payload.catatanAdmin || null,
    });
    const current = await this.getApplicantById(formId, applicantId);
    return { ...current, stage: payload.stage, status: payload.status, catatanAdmin: payload.catatanAdmin };
  }

  async submitRecruitment(formId: string, payload: RecruitmentSubmitPayload): Promise<void> {
    await api.post(`/organizer/recruitment/${formId}/apply`, {
      nama_lengkap: payload.namaLengkap,
      email: payload.email,
      no_hp: payload.noHp || null,
      nim: payload.nim || null,
      jawaban: payload.formAnswers,
    });
  }

  async getPublicRecruitmentForm(_slug: string, formId: string): Promise<RecruitmentForm> {
    const res = await api.get<{ data?: BackendRecruitmentRow[] }>("/organizer/recruitment/public");
    const list = (res.data?.data ?? []).map(mapRecruitmentRow);
    const found = list.find((f) => f.id === formId) || list[0];
    if (!found) throw new Error("Form pendaftaran tidak ditemukan");
    return found;
  }
}

// ─── Utilitas ────────────────────────────────────────────

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function formatPeriode(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

// ─── Singleton proxy ─────────────────────────────────────

const mockAdapter = new MemberMockService();
const realAdapter = new MemberRealService();

export const memberService: MemberService = new Proxy({} as MemberService, {
  get(_target, prop: keyof MemberService) {
    const adapter = isMockEnabled() ? mockAdapter : realAdapter;
    const value = adapter[prop];
    if (typeof value === "function") {
      return value.bind(adapter);
    }
    return value;
  },
});
