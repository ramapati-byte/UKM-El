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

// ─── Real adapter (stub — gunakan saat backend tersedia) ─

class MemberRealService implements MemberService {
  async listMembers(_params?: MemberQuery): Promise<Paginated<MemberEntity>> {
    throw new Error("Real adapter belum tersedia — gunakan mock");
  }
  async getMemberById(_id: string): Promise<MemberEntity> {
    throw new Error("Real adapter belum tersedia");
  }
  async updateMember(_id: string, _payload: MemberUpdatePayload): Promise<MemberEntity> {
    throw new Error("Real adapter belum tersedia");
  }
  async deleteMember(_id: string): Promise<void> {
    throw new Error("Real adapter belum tersedia");
  }
  async getMemberHistory(_mahasiswaId: string): Promise<MemberHistoryItem[]> {
    throw new Error("Real adapter belum tersedia");
  }
  async getMemberStats(_ukmId?: string): Promise<MemberStats> {
    throw new Error("Real adapter belum tersedia");
  }
  async getMemberCard(_mahasiswaId: string): Promise<MemberCard | null> {
    throw new Error("Real adapter belum tersedia");
  }
  async listRecruitmentForms(_ukmId?: string): Promise<RecruitmentForm[]> {
    throw new Error("Real adapter belum tersedia");
  }
  async getRecruitmentFormById(_id: string): Promise<RecruitmentForm> {
    throw new Error("Real adapter belum tersedia");
  }
  async createRecruitmentForm(_payload: RecruitmentFormCreatePayload): Promise<RecruitmentForm> {
    throw new Error("Real adapter belum tersedia");
  }
  async updateRecruitmentForm(_id: string, _payload: RecruitmentFormUpdatePayload): Promise<RecruitmentForm> {
    throw new Error("Real adapter belum tersedia");
  }
  async deleteRecruitmentForm(_id: string): Promise<void> {
    throw new Error("Real adapter belum tersedia");
  }
  async publishRecruitmentForm(_id: string): Promise<RecruitmentForm> {
    throw new Error("Real adapter belum tersedia");
  }
  async closeRecruitmentForm(_id: string): Promise<RecruitmentForm> {
    throw new Error("Real adapter belum tersedia");
  }
  async addFormField(_formId: string, _field: Omit<RecruitmentField, "id">): Promise<RecruitmentField> {
    throw new Error("Real adapter belum tersedia");
  }
  async updateFormField(_formId: string, _fieldId: string, _field: Partial<RecruitmentField>): Promise<RecruitmentField> {
    throw new Error("Real adapter belum tersedia");
  }
  async deleteFormField(_formId: string, _fieldId: string): Promise<void> {
    throw new Error("Real adapter belum tersedia");
  }
  async reorderFormFields(_formId: string, _orderedIds: string[]): Promise<void> {
    throw new Error("Real adapter belum tersedia");
  }
  async listApplicants(_formId: string, _params?: ApplicantQuery): Promise<Paginated<Applicant>> {
    throw new Error("Real adapter belum tersedia");
  }
  async getApplicantById(_formId: string, _applicantId: string): Promise<Applicant> {
    throw new Error("Real adapter belum tersedia");
  }
  async moveApplicant(_formId: string, _applicantId: string, _payload: ApplicantMovePayload): Promise<Applicant> {
    throw new Error("Real adapter belum tersedia");
  }
  async submitRecruitment(_formId: string, _payload: RecruitmentSubmitPayload): Promise<void> {
    throw new Error("Real adapter belum tersedia");
  }
  async getPublicRecruitmentForm(_slug: string, _formId: string): Promise<RecruitmentForm> {
    throw new Error("Real adapter belum tersedia");
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
