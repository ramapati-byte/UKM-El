// app/organizer/recruitment/[id]/page.tsx — Builder form + pipeline seleksi
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "../../../../components/shell/AppShell";
import { Card, CardBody, CardHeader, CardTitle } from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";
import Tabs from "../../../../components/ui/Tabs";
import RecruitmentPipeline from "../../../../components/members/RecruitmentPipeline";
import FormFieldBuilder from "../../../../components/members/FormFieldBuilder";
import { RecruitmentFormStatusBadge } from "../../../../components/members/RecruitmentStatusBadge";
import LoadingSkeleton from "../../../../components/ui/LoadingSkeleton";
import ErrorState from "../../../../components/ui/ErrorState";
import { memberService } from "../../../../services/member.service";
import type {
  RecruitmentForm,
  RecruitmentField,
  Applicant,
  RecruitmentStage,
  ApplicantStatus,
} from "../../../../types/member";

export default function RecruitmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [form, setForm]             = useState<RecruitmentForm | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [saving, setSaving]         = useState(false);
  const [activeTab, setActiveTab]   = useState("detail");
  const [toast, setToast]           = useState<{ msg: string; type: "success" | "danger" } | null>(null);

  // form edit state
  const [editJudul, setEditJudul]           = useState("");
  const [editDeskripsi, setEditDeskripsi]   = useState("");
  const [editPersyaratan, setEditPersyaratan] = useState("");
  const [editKuota, setEditKuota]           = useState("");
  const [editAwal, setEditAwal]             = useState("");
  const [editAkhir, setEditAkhir]           = useState("");
  const [editFields, setEditFields]         = useState<RecruitmentField[]>([]);

  const showToast = (msg: string, type: "success" | "danger" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [f, apps] = await Promise.all([
        memberService.getRecruitmentFormById(id),
        memberService.listApplicants(id),
      ]);
      setForm(f);
      setApplicants(apps.data);
      setEditJudul(f.judul);
      setEditDeskripsi(f.deskripsi ?? "");
      setEditPersyaratan(f.persyaratan ?? "");
      setEditKuota(f.kuota ? String(f.kuota) : "");
      setEditAwal(f.periodeAwal);
      setEditAkhir(f.periodeAkhir);
      setEditFields([...f.formFields]);
    } catch {
      setError("Gagal memuat form rekrutmen.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleSaveDetail = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const updated = await memberService.updateRecruitmentForm(form.id, {
        judul: editJudul,
        deskripsi: editDeskripsi || undefined,
        persyaratan: editPersyaratan || undefined,
        kuota: editKuota ? Number(editKuota) : undefined,
        periodeAwal: editAwal,
        periodeAkhir: editAkhir,
      });
      setForm(updated);
      showToast("Detail form berhasil disimpan.");
    } catch {
      showToast("Gagal menyimpan detail.", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFields = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const updated = await memberService.updateRecruitmentForm(form.id, {
        formFields: editFields,
      });
      setForm(updated);
      showToast("Field form berhasil disimpan.");
    } catch {
      showToast("Gagal menyimpan field.", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleMoveApplicant = async (
    applicantId: string,
    stage: RecruitmentStage,
    status: ApplicantStatus,
    catatan?: string
  ) => {
    if (!form) return;
    const updated = await memberService.moveApplicant(form.id, applicantId, {
      stage,
      status,
      catatanAdmin: catatan,
    });
    setApplicants((prev) =>
      prev.map((a) => (a.id === applicantId ? updated : a))
    );
    showToast(`Pendaftar berhasil ${status === "lolos" ? "dipindahkan" : "digugurkan"}.`);
  };

  const handlePublish = async () => {
    if (!form) return;
    try {
      const updated = await (form.status === "draft"
        ? memberService.publishRecruitmentForm(form.id)
        : memberService.closeRecruitmentForm(form.id));
      setForm(updated);
      showToast(
        form.status === "draft" ? "Form dibuka untuk pendaftaran." : "Pendaftaran ditutup."
      );
    } catch {
      showToast("Gagal mengubah status form.", "danger");
    }
  };

  if (loading) {
    return (
      <AppShell title="Detail Rekrutmen">
        <div className="p-4 md:p-6"><LoadingSkeleton variant="card" rows={6} /></div>
      </AppShell>
    );
  }

  if (error || !form) {
    return (
      <AppShell title="Detail Rekrutmen">
        <div className="p-4 md:p-6"><ErrorState message={error ?? "Form tidak ditemukan."} onRetry={load} /></div>
      </AppShell>
    );
  }

  const isDraft  = form.status === "draft";
  const isOpen   = form.status === "open";

  return (
    <AppShell
      title={form.judul}
      subtitle={`${applicants.length} pendaftar`}
      breadcrumbs={[
        { label: "Organizer", href: "/organizer/dashboard" },
        { label: "Rekrutmen", href: "/organizer/recruitment" },
        { label: form.judul },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <RecruitmentFormStatusBadge status={form.status} />
          {form.status !== "closed" && (
            <Button
              variant={isDraft ? "success" : "warning"}
              size="sm"
              icon={isDraft ? "bi-send" : "bi-x-circle"}
              onClick={handlePublish}
            >
              {isDraft ? "Buka Pendaftaran" : "Tutup Pendaftaran"}
            </Button>
          )}
          <Button variant="outline" size="sm" icon="bi-arrow-left" onClick={() => router.back()}>
            Kembali
          </Button>
        </div>
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

      <div className="p-4 md:p-6 space-y-4">
        {/* Tabs */}
        <Tabs
          tabs={[
            { id: "detail",   label: "Detail Form",          icon: "bi-file-text"    },
            { id: "fields",   label: "Field / Pertanyaan",   icon: "bi-list-task"    },
            { id: "pipeline", label: `Pipeline (${applicants.length})`, icon: "bi-kanban" },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Tab: Detail */}
        {activeTab === "detail" && (
          <Card>
            <CardHeader>
              <CardTitle icon="bi-pencil-square">Informasi Form</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="label-form">Judul <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={editJudul}
                  onChange={(e) => setEditJudul(e.target.value)}
                  disabled={!isDraft}
                  className="field"
                />
              </div>
              <div>
                <label className="label-form">Deskripsi</label>
                <textarea rows={3} value={editDeskripsi} onChange={(e) => setEditDeskripsi(e.target.value)} disabled={!isDraft} className="field resize-none" />
              </div>
              <div>
                <label className="label-form">Persyaratan</label>
                <textarea rows={4} value={editPersyaratan} onChange={(e) => setEditPersyaratan(e.target.value)} disabled={!isDraft} className="field resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label-form">Kuota</label>
                  <input type="number" min="1" value={editKuota} onChange={(e) => setEditKuota(e.target.value)} disabled={!isDraft} className="field" placeholder="Tidak dibatasi" />
                </div>
                <div>
                  <label className="label-form">Tanggal Buka</label>
                  <input type="date" value={editAwal} onChange={(e) => setEditAwal(e.target.value)} disabled={!isDraft} className="field" />
                </div>
                <div>
                  <label className="label-form">Tanggal Tutup</label>
                  <input type="date" value={editAkhir} onChange={(e) => setEditAkhir(e.target.value)} disabled={!isDraft} className="field" />
                </div>
              </div>

              {isDraft && (
                <div className="flex justify-end pt-2">
                  <Button variant="primary" loading={saving} onClick={handleSaveDetail}>
                    Simpan Detail
                  </Button>
                </div>
              )}

              {!isDraft && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300">
                  <i className="bi bi-lock mr-1" />
                  Form sudah dibuka / ditutup. Detail tidak dapat diedit.
                </div>
              )}

              {/* Link publik */}
              {isOpen && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                    <i className="bi bi-link-45deg mr-1" />Link Publik
                  </p>
                  <code className="text-xs text-emerald-800 dark:text-emerald-300 break-all">
                    {typeof window !== "undefined" ? window.location.origin : ""}/ukm/bem/recruitment/{form.id}
                  </code>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Tab: Fields */}
        {activeTab === "fields" && (
          <Card>
            <CardHeader>
              <CardTitle icon="bi-layout-text-window">Field Formulir</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <FormFieldBuilder
                fields={editFields}
                onChange={setEditFields}
                disabled={!isDraft}
              />
              {isDraft && (
                <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="primary" loading={saving} onClick={handleSaveFields}>
                    Simpan Field
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Tab: Pipeline */}
        {activeTab === "pipeline" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total <strong>{applicants.length}</strong> pendaftar. Klik kartu untuk detail, hover untuk aksi.
              </p>
            </div>
            <RecruitmentPipeline
              applicants={applicants}
              onMove={handleMoveApplicant}
            />
          </div>
        )}
      </div>

      {/* Tailwind utility classes dipakai langsung untuk field agar konsisten */}
      <style jsx>{`
        .label-form {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--slate-700, #334155);
          margin-bottom: 0.375rem;
        }
        .field {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #cbd5e1;
          background: white;
          font-size: 0.875rem;
          color: #1e293b;
          padding: 0.5rem 0.75rem;
          outline: none;
        }
        .field:focus {
          ring: 2px;
        }
        .field:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: #f8fafc;
        }
      `}</style>
    </AppShell>
  );
}
