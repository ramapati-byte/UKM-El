// components/members/FormFieldBuilder.tsx — Builder form dinamis recruitment

"use client";

import { useState } from "react";
import type { RecruitmentField, RecruitmentFieldType } from "../../types/member";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

const FIELD_TYPE_LABELS: Record<RecruitmentFieldType, string> = {
  text:     "Teks Pendek",
  email:    "Email",
  tel:      "Nomor Telepon",
  select:   "Dropdown",
  radio:    "Pilihan Ganda",
  textarea: "Teks Panjang",
  file:     "Unggah File",
};

interface Props {
  fields: RecruitmentField[];
  onChange: (fields: RecruitmentField[]) => void;
  disabled?: boolean;
}

interface FieldFormState {
  label: string;
  fieldType: RecruitmentFieldType;
  isRequired: boolean;
  placeholder: string;
  optionsRaw: string; // comma-separated
}

const EMPTY_FORM: FieldFormState = {
  label: "",
  fieldType: "text",
  isRequired: true,
  placeholder: "",
  optionsRaw: "",
};

export default function FormFieldBuilder({ fields, onChange, disabled = false }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FieldFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FieldFormState>>({});

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (field: RecruitmentField) => {
    setEditingId(field.id);
    setForm({
      label: field.label,
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      placeholder: field.placeholder ?? "",
      optionsRaw: (field.options ?? []).join(", "),
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = (): boolean => {
    const newErrors: Partial<FieldFormState> = {};
    if (!form.label.trim()) newErrors.label = "Label wajib diisi";
    if (
      (form.fieldType === "select" || form.fieldType === "radio") &&
      !form.optionsRaw.trim()
    ) {
      newErrors.optionsRaw = "Pilihan wajib diisi";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const options =
      form.fieldType === "select" || form.fieldType === "radio"
        ? form.optionsRaw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    if (editingId) {
      onChange(
        fields.map((f) =>
          f.id === editingId
            ? {
                ...f,
                label: form.label,
                fieldType: form.fieldType,
                isRequired: form.isRequired,
                placeholder: form.placeholder || undefined,
                options,
              }
            : f
        )
      );
    } else {
      const newField: RecruitmentField = {
        id: `ff-local-${Date.now()}`,
        label: form.label,
        fieldType: form.fieldType,
        isRequired: form.isRequired,
        placeholder: form.placeholder || undefined,
        options,
        urutan: fields.length + 1,
      };
      onChange([...fields, newField]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Hapus field ini?")) return;
    onChange(fields.filter((f) => f.id !== id));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...fields];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next.map((f, i) => ({ ...f, urutan: i + 1 })));
  };

  const moveDown = (idx: number) => {
    if (idx === fields.length - 1) return;
    const next = [...fields];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next.map((f, i) => ({ ...f, urutan: i + 1 })));
  };

  const needsOptions = form.fieldType === "select" || form.fieldType === "radio";

  return (
    <div>
      {/* List field */}
      <div className="space-y-2 mb-4">
        {fields.length === 0 && (
          <div className="text-center py-8 text-sm text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            <i className="bi bi-layout-text-window text-2xl block mb-1" aria-hidden="true" />
            Belum ada field. Tambahkan field di bawah.
          </div>
        )}
        {fields.map((field, idx) => (
          <div
            key={field.id}
            className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3"
          >
            {/* urutan */}
            <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0">
              {idx + 1}
            </span>

            {/* info field */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {field.label}
                </span>
                {field.isRequired && (
                  <span className="text-[10px] text-red-500 font-medium">Wajib</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                  {FIELD_TYPE_LABELS[field.fieldType]}
                </span>
                {field.options && field.options.length > 0 && (
                  <span className="truncate max-w-[200px]">
                    {field.options.join(", ")}
                  </span>
                )}
              </div>
            </div>

            {/* Aksi */}
            {!disabled && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="p-1.5 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  aria-label="Pindah ke atas"
                >
                  <i className="bi bi-arrow-up" />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(idx)}
                  disabled={idx === fields.length - 1}
                  className="p-1.5 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  aria-label="Pindah ke bawah"
                >
                  <i className="bi bi-arrow-down" />
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(field)}
                  className="p-1.5 rounded text-indigo-500 hover:text-indigo-700"
                  aria-label="Edit field"
                >
                  <i className="bi bi-pencil" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(field.id)}
                  className="p-1.5 rounded text-red-400 hover:text-red-600"
                  aria-label="Hapus field"
                >
                  <i className="bi bi-trash" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {!disabled && (
        <Button variant="outline" icon="bi-plus-lg" onClick={openAdd} size="sm">
          Tambah Field
        </Button>
      )}

      {/* Modal tambah / edit field */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Field" : "Tambah Field"}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Contoh: Program Studi"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
            {errors.label && (
              <p className="text-xs text-red-500 mt-1">{errors.label}</p>
            )}
          </div>

          {/* Tipe field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Tipe Field
            </label>
            <select
              value={form.fieldType}
              onChange={(e) =>
                setForm({ ...form, fieldType: e.target.value as RecruitmentFieldType })
              }
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              {(Object.keys(FIELD_TYPE_LABELS) as RecruitmentFieldType[]).map((t) => (
                <option key={t} value={t}>
                  {FIELD_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          {/* Opsi (untuk select & radio) */}
          {needsOptions && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Pilihan <span className="text-red-500">*</span>
                <span className="text-slate-400 font-normal ml-1">(pisahkan dengan koma)</span>
              </label>
              <input
                type="text"
                value={form.optionsRaw}
                onChange={(e) => setForm({ ...form, optionsRaw: e.target.value })}
                placeholder="Contoh: Opsi A, Opsi B, Opsi C"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              {errors.optionsRaw && (
                <p className="text-xs text-red-500 mt-1">{errors.optionsRaw}</p>
              )}
            </div>
          )}

          {/* Placeholder */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Placeholder <span className="text-slate-400 font-normal">(opsional)</span>
            </label>
            <input
              type="text"
              value={form.placeholder}
              onChange={(e) => setForm({ ...form, placeholder: e.target.value })}
              placeholder="Teks placeholder di dalam field"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          {/* Wajib */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isRequired}
              onChange={(e) => setForm({ ...form, isRequired: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Field wajib diisi
            </span>
          </label>
        </div>
      </Modal>
    </div>
  );
}
