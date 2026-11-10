// app/organizer/recruitment/page.tsx — Daftar form recruitment & pipeline
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AppShell from "../../../components/shell/AppShell";
import { Card, CardBody, CardHeader, CardTitle, CardTools } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { RecruitmentFormStatusBadge } from "../../../components/members/RecruitmentStatusBadge";
import Modal from "../../../components/ui/Modal";
import LoadingSkeleton from "../../../components/ui/LoadingSkeleton";
import ErrorState from "../../../components/ui/ErrorState";
import EmptyState from "../../../components/ui/EmptyState";
import { memberService } from "../../../services/member.service";
import type { RecruitmentForm, RecruitmentFormStatus } from "../../../types/member";

interface CreateFormState {
  judul: string;
  deskripsi: string;
  persyaratan: string;
  kuota: string;
  periodeAwal: string;
  periodeAkhir: string;
}

const EMPTY_FORM: CreateFormState = {
  judul: "",
  deskripsi: "",
  persyaratan: "",
  kuota: "",
  periodeAwal: "",
  periodeAkhir: "",
};

export default function RecruitmentPage() {
  const [forms, setForms]     = useState<RecruitmentForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [formState, setFormState]   = useState<CreateFormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<CreateFormState>>({});
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState<{ msg: string; type: "success" | "danger" } | null>(null);

  const showToast = (msg: string, type: "success" | "danger" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await memberService.listRecruitmentForms();
      setForms(list);
    } catch {
      setError("Gagal memuat daftar rekrutmen.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const validate = (): boolean => {
    const err: Partial<CreateFormState> = {};
    if (!formState.judul.trim())       err.judul      = "Judul wajib diisi";
    if (!formState.periodeAwal)        err.periodeAwal = "Tanggal buka wajib diisi";
    if (!formState.periodeAkhir)       err.periodeAkhir = "Tanggal tutup wajib diisi";
    if (formState.periodeAwal && formState.periodeAkhir && formState.periodeAwal > formState.periodeAkhir) {
      err.periodeAkhir = "Tanggal tutup harus setelah tanggal buka";
    }
    setFormErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await memberService.createRecruitmentForm({
        ukmId: "ukm-bem",
        judul: formState.judul,
        deskripsi: formState.deskripsi || undefined,
        persyaratan: formState.persyaratan || undefined,
        kuota: formState.kuota ? Number(formState.kuota) : undefined,
        periodeAwal: formState.periodeAwal,
        periodeAkhir: formState.periodeAkhir,
        status: "draft",
      });
      showToast("Form rekrutmen berhasil dibuat.");
      setCreateOpen(false);
      setFormState(EMPTY_FORM);
      load();
    } catch {
      showToast("Gagal membuat form rekrutmen.", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, judul: string) => {
    if (!confirm(`Hapus form "${judul}"?`)) return;
    try {
      await memberService.deleteRecruitmentForm(id);
      showToast("Form rekrutmen dihapus.");
      load();
    } catch {
      showToast("Gagal menghapus form.", "danger");
    }
  };

  const handleToggleStatus = async (form: RecruitmentForm) => {
    try {
      if (form.status === "draft")  await memberService.publishRecruitmentForm(form.id);
      if (form.status === "open")   await memberService.closeRecruitmentForm(form.id);
      showToast("Status form diperbarui.");
      load();
    } catch {
      showToast("Gagal mengubah status.", "danger");
    }
  };

  const statusOrder: Record<RecruitmentFormStatus, number> = { open: 0, draft: 1, closed: 2 };
  const sorted = [...forms].sort((a, b) => (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3));

  return (
    <AppShell
      title="Open Recruitment"
      subtitle="Kelola form pendaftaran anggota baru"
      breadcrumbs={[
        { label: "Organizer", href: "/organizer/dashboard" },
        { label: "Rekrutmen" },
      ]}
      actions={
        <Button
          variant="primary"
          icon="bi-plus-lg"
          onClick={() => { setFormState(EMPTY_FORM); setFormErrors({}); setCreateOpen(true); }}
        >
          Buat Form Baru
        </Button>
      }
    >
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2 ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          <i className={`bi ${toast.type === "success" ? "bi-check-circle" : "bi-x-circle"}`} />
          {toast.msg}
        </div>
      )}

      <div className="p-4 md:p-6">
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : loading ? (
          <div className="space-y-4">
            <LoadingSkeleton variant="card" rows={3} />
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon="bi-person-plus"
            title="Belum ada form rekrutmen"
            message="Buat form rekrutmen pertama untuk membuka pendaftaran anggota baru."
            action={
              <Button
                variant="primary"
                icon="bi-plus-lg"
                onClick={() => setCreateOpen(true)}
              >
                Buat Form Baru
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sorted.map((form) => (
              <RecruitmentFormCard
                key={form.id}
                form={form}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal buat form */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Buat Form Rekrutmen Baru"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Batal</Button>
            <Button variant="primary" loading={saving} onClick={handleCreate}>Buat Form</Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField
            label="Judul Form"
            required
            error={formErrors.judul}
          >
            <input
              type="text"
              value={formState.judul}
              onChange={(e) => setFormState({ ...formState, judul: e.target.value })}
              placeholder="Contoh: Open Recruitment BEM 2027"
              className="form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </FormField>

          <FormField label="Deskripsi">
            <textarea
              rows={2}
              value={formState.deskripsi}
              onChange={(e) => setFormState({ ...formState, deskripsi: e.target.value })}
              placeholder="Deskripsi singkat rekrutmen..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
            />
          </FormField>

          <FormField label="Persyaratan">
            <textarea
              rows={3}
              value={formState.persyaratan}
              onChange={(e) => setFormState({ ...formState, persyaratan: e.target.value })}
              placeholder="1. Mahasiswa aktif&#10;2. IPK minimal ..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
            />
          </FormField>

          <FormField label="Kuota">
            <input
              type="number"
              min="1"
              value={formState.kuota}
              onChange={(e) => setFormState({ ...formState, kuota: e.target.value })}
              placeholder="Kosongkan jika tidak dibatasi"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tanggal Buka" required error={formErrors.periodeAwal}>
              <input
                type="date"
                value={formState.periodeAwal}
                onChange={(e) => setFormState({ ...formState, periodeAwal: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </FormField>
            <FormField label="Tanggal Tutup" required error={formErrors.periodeAkhir}>
              <input
                type="date"
                value={formState.periodeAkhir}
                onChange={(e) => setFormState({ ...formState, periodeAkhir: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </FormField>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}

// ─── Sub-komponen ────────────────────────────────────────

function RecruitmentFormCard({
  form,
  onToggleStatus,
  onDelete,
}: {
  form: RecruitmentForm;
  onToggleStatus: (form: RecruitmentForm) => void;
  onDelete: (id: string, judul: string) => void;
}) {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <RecruitmentFormStatusBadge status={form.status} />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-2">
            {form.judul}
          </h3>
        </div>
        <CardTools>
          {form.status === "draft" && (
            <button
              type="button"
              onClick={() => onDelete(form.id, form.judul)}
              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              title="Hapus"
            >
              <i className="bi bi-trash text-sm" />
            </button>
          )}
        </CardTools>
      </CardHeader>

      <CardBody className="flex-1 space-y-3">
        {form.deskripsi && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            {form.deskripsi}
          </p>
        )}

        <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <i className="bi bi-calendar-range" />
            <span>{formatDate(form.periodeAwal)} – {formatDate(form.periodeAkhir)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <i className="bi bi-people" />
            <span>
              {form.totalPendaftar} pendaftar
              {form.kuota ? ` / ${form.kuota} kuota` : ""}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <i className="bi bi-list-task" />
            <span>{form.formFields.length} field</span>
          </div>
        </div>
      </CardBody>

      <div className="px-5 pb-4 flex items-center gap-2">
        <Link
          href={`/organizer/recruitment/${form.id}`}
          className="flex-1 text-center text-sm font-medium py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
        >
          {form.status === "draft" ? "Edit & Atur" : "Lihat Pipeline"}
        </Link>

        {form.status !== "closed" && (
          <button
            type="button"
            onClick={() => onToggleStatus(form)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              form.status === "draft"
                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100"
                : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100"
            }`}
          >
            {form.status === "draft" ? "Buka" : "Tutup"}
          </button>
        )}
      </div>
    </Card>
  );
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
