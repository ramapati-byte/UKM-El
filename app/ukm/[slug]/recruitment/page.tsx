// app/ukm/[slug]/recruitment/page.tsx — Form pendaftaran rekrutmen publik
"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { memberService } from "../../../../services/member.service";
import type { RecruitmentForm, RecruitmentField, RecruitmentSubmitPayload } from "../../../../types/member";

export default function PublicRecruitmentPage() {
  const { slug }        = useParams<{ slug: string }>();
  const searchParams    = useSearchParams();
  const formId          = searchParams.get("form") ?? "rec-001";

  const [form, setForm]           = useState<RecruitmentForm | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data pendaftar
  const [namaLengkap, setNamaLengkap] = useState("");
  const [email, setEmail]             = useState("");
  const [noHp, setNoHp]               = useState("");
  const [nim, setNim]                 = useState("");
  const [answers, setAnswers]         = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const f = await memberService.getPublicRecruitmentForm(slug, formId);
        setForm(f);
        // Inisialisasi answers
        const init: Record<string, string> = {};
        f.formFields.forEach((ff) => { init[ff.id] = ""; });
        setAnswers(init);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Form tidak ditemukan atau sudah ditutup.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, formId]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!namaLengkap.trim())     errs.__nama  = "Nama wajib diisi";
    if (!email.trim())           errs.__email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.__email = "Format email tidak valid";

    form?.formFields.forEach((ff) => {
      if (ff.isRequired && !answers[ff.id]?.trim()) {
        errs[ff.id] = `${ff.label} wajib diisi`;
      }
    });
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (!validate()) {
      // Scroll ke error pertama
      const firstError = document.querySelector("[data-field-error]");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    setGlobalError(null);
    try {
      const payload: RecruitmentSubmitPayload = {
        namaLengkap,
        email,
        noHp: noHp || undefined,
        nim: nim || undefined,
        formAnswers: form.formFields.map((ff) => ({
          fieldId: ff.id,
          value: answers[ff.id] ?? "",
        })),
      };
      await memberService.submitRecruitment(form.id, payload);
      setSubmitted(true);
    } catch (e) {
      setGlobalError(e instanceof Error ? e.message : "Gagal mengirim pendaftaran. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm">Memuat form pendaftaran...</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center">
          <i className="bi bi-x-circle-fill text-4xl text-red-500 mb-3 block" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Form Tidak Tersedia
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <i className="bi bi-house-door" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // ── Sukses ────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center mx-auto mb-4">
            <i className="bi bi-check-lg text-3xl text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Pendaftaran Berhasil!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            Terima kasih, <strong>{namaLengkap}</strong>! Pendaftaran Anda untuk{" "}
            <strong>{form?.judul}</strong> telah diterima.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
            Tim kami akan menghubungi Anda melalui email <strong>{email}</strong> untuk informasi selanjutnya.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition"
          >
            <i className="bi bi-house-door" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header publik */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center gap-1.5">
            <i className="bi bi-arrow-left" />
            Kembali
          </Link>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wide">
            Open Recruitment
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Info form */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-indigo-200 mb-1">Open Recruitment</p>
          <h1 className="text-2xl font-bold mb-2">{form?.judul}</h1>
          {form?.deskripsi && (
            <p className="text-sm text-indigo-100">{form.deskripsi}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-indigo-200">
            <span className="flex items-center gap-1">
              <i className="bi bi-calendar-range" />
              {new Date(form!.periodeAwal).toLocaleDateString("id-ID", { dateStyle: "medium" })}
              {" – "}
              {new Date(form!.periodeAkhir).toLocaleDateString("id-ID", { dateStyle: "medium" })}
            </span>
            {form?.kuota && (
              <span className="flex items-center gap-1">
                <i className="bi bi-people" />
                Kuota: {form.kuota}
              </span>
            )}
          </div>
        </div>

        {/* Persyaratan */}
        {form?.persyaratan && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
              <i className="bi bi-list-check" />
              Persyaratan
            </p>
            <pre className="text-xs text-amber-700 dark:text-amber-400 whitespace-pre-wrap font-sans">
              {form.persyaratan}
            </pre>
          </div>
        )}

        {/* Form pendaftaran */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <i className="bi bi-person-fill text-indigo-600" />
              Data Diri
            </h2>

            <PubField label="Nama Lengkap" required error={fieldErrors.__nama}>
              <input
                type="text"
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                className="pub-input"
                autoFocus
              />
            </PubField>

            <PubField label="Email Aktif" required error={fieldErrors.__email}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh@email.com"
                className="pub-input"
              />
            </PubField>

            <div className="grid grid-cols-2 gap-3">
              <PubField label="NIM">
                <input
                  type="text"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  placeholder="Nomor Induk Mahasiswa"
                  className="pub-input"
                />
              </PubField>
              <PubField label="No. WhatsApp">
                <input
                  type="tel"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="pub-input"
                />
              </PubField>
            </div>
          </div>

          {/* Field dinamis */}
          {form && form.formFields.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <i className="bi bi-pencil-square text-indigo-600" />
                Formulir Rekrutmen
              </h2>

              {form.formFields
                .sort((a, b) => a.urutan - b.urutan)
                .map((field) => (
                  <DynamicField
                    key={field.id}
                    field={field}
                    value={answers[field.id] ?? ""}
                    onChange={(v) => setAnswers((prev) => ({ ...prev, [field.id]: v }))}
                    error={fieldErrors[field.id]}
                  />
                ))}
            </div>
          )}

          {/* Error global */}
          {globalError && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
              <i className="bi bi-exclamation-triangle shrink-0 mt-0.5" />
              {globalError}
            </div>
          )}

          {/* Tombol submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm"
          >
            {submitting ? (
              <>
                <i className="bi bi-arrow-repeat animate-spin" />
                Mengirim pendaftaran...
              </>
            ) : (
              <>
                <i className="bi bi-send" />
                Kirim Pendaftaran
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            Data Anda hanya digunakan untuk keperluan proses seleksi.
          </p>
        </form>
      </main>

      <style jsx>{`
        .pub-input {
          width: 100%;
          border-radius: 0.625rem;
          border: 1px solid #e2e8f0;
          background: #fff;
          font-size: 0.875rem;
          color: #1e293b;
          padding: 0.625rem 0.75rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .pub-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
      `}</style>
    </div>
  );
}

// ─── Sub-komponen ─────────────────────────────────────────

function PubField({
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
    <div data-field-error={error ? "true" : undefined}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <i className="bi bi-exclamation-circle" />
          {error}
        </p>
      )}
    </div>
  );
}

function DynamicField({
  field,
  value,
  onChange,
  error,
}: {
  field: RecruitmentField;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const baseClass =
    "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400";

  return (
    <PubField
      label={field.label}
      required={field.isRequired}
      error={error}
    >
      {field.fieldType === "textarea" ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={`${baseClass} resize-none`}
        />
      ) : field.fieldType === "select" ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={baseClass}>
          <option value="">-- Pilih --</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : field.fieldType === "radio" ? (
        <div className="space-y-2 mt-1">
          {field.options?.map((opt) => (
            <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="w-4 h-4 text-indigo-600"
              />
              {opt}
            </label>
          ))}
        </div>
      ) : (
        <input
          type={field.fieldType === "email" ? "email" : field.fieldType === "tel" ? "tel" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={baseClass}
        />
      )}
    </PubField>
  );
}
