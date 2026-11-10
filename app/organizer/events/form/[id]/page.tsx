"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "../../../../../lib/api";
import DashboardLayout from "../../../../../components/DashboardLayout";
import Card, {
  CardBody,
  CardHeader,
  CardTitle,
  CardTools,
} from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Callout from "@/components/ui/Callout";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface FormField {
  id: number;
  label: string;
  field_type: string;
  is_required: boolean;
  options: string | null;
  placeholder: string | null;
}

interface FieldFormData {
  id: number | null;
  label: string;
  field_type: string;
  is_required: boolean;
  placeholder: string;
  options: string;
}

interface FormEventData {
  judul?: string;
  tanggal_waktu?: string;
  lokasi?: string;
}

const FIELD_TYPE_OPTIONS = [
  { value: "text", label: "Teks Singkat" },
  { value: "textarea", label: "Area Teks Panjang" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Nomor HP" },
  { value: "select", label: "Dropdown Menu" },
  { value: "radio", label: "Pilihan Ganda (Radio)" },
];

export default function AturFormPage() {
  const params = useParams();
  const { id } = params;
  let decoded_id = id as string;
  if (id) {
    try { decoded_id = atob(decodeURIComponent(id as string)); } catch (e) {}
  }

  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [eventData, setEventData] = useState<FormEventData | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [formData, setFormData] = useState<FieldFormData>({
    id: null,
    label: "",
    field_type: "text",
    is_required: true,
    placeholder: "",
    options: ""
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      setUser(
        storedUser
          ? JSON.parse(storedUser)
          : { id: 2, name: "BEM El Rahma", email: "bem@elrahma.ac.id", role: "penyelenggara" }
      );
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const resEvent = await api.get(`/events/${decoded_id}`);
      setEventData(resEvent.data);

      const resFields = await api.get(`/form/${decoded_id}`);
      setFields(resFields.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (decoded_id) fetchData();
  }, [decoded_id]);

  const handleOpenModal = (field: FormField | null = null) => {
    if (field) {
      setIsEditing(true);
      setFormData({
        id: field.id,
        label: field.label,
        field_type: field.field_type,
        is_required: !!field.is_required,
        placeholder: field.placeholder || "",
        options: field.options || ""
      });
    } else {
      setIsEditing(false);
      setFormData({
        id: null,
        label: "",
        field_type: "text",
        is_required: true,
        placeholder: "",
        options: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await api.post(`/form/${decoded_id}`, formData);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan field!");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteField = async (fieldId: number) => {
    if (confirm("Yakin ingin menghapus pertanyaan ini? Data yang sudah diisi peserta mungkin akan hilang.")) {
      try {
        await api.delete(`/form/${fieldId}`);
        fetchData();
      } catch (err) {
        alert("Gagal menghapus field!");
      }
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'text': return "bi-input-cursor-text";
      case 'email': return "bi-envelope";
      case 'tel': return "bi-telephone";
      case 'textarea': return "bi-textarea-resize";
      case 'select': return "bi-list-ul";
      case 'radio': return "bi-ui-checks";
      default: return "bi-input-cursor-text";
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <DashboardLayout
      user={user}
      title="Form Pendaftaran"
      subtitle={`Atur pertanyaan pendaftaran untuk event: ${eventData?.judul ?? "Memuat..."}`}
      links={[]}
      onLogout={() => {}}
    >
      <div className="space-y-6 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Kelola Form Pendaftaran
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Nama dan Email akan otomatis ditanyakan oleh sistem.
            </p>
          </div>
          <Button icon="bi-plus-lg" onClick={() => handleOpenModal()}>
            Tambah Pertanyaan
          </Button>
        </div>

        {loading ? (
          <LoadingSkeleton variant="table" rows={5} />
        ) : (
          <>
            <Callout variant="info" title="Preview Event" icon="bi-info-circle-fill">
              <div className="flex flex-wrap gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <i className="bi bi-calendar-event" aria-hidden="true" />
                  {formatDate(eventData?.tanggal_waktu ?? "")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="bi bi-geo-alt" aria-hidden="true" />
                  {eventData?.lokasi}
                </span>
              </div>
            </Callout>

            <Card>
              <CardHeader>
                <CardTitle icon="bi-list-check">Daftar Pertanyaan</CardTitle>
                <CardTools>
                  <Badge variant="secondary" size="sm">
                    {fields.length} pertanyaan
                  </Badge>
                </CardTools>
              </CardHeader>

              <CardBody className="p-0">
                {fields.length === 0 ? (
                  <div className="p-5">
                    <EmptyState
                      icon="bi-list-check"
                      title="Belum Ada Pertanyaan"
                      message="Form pendaftaran masih kosong. Tambahkan pertanyaan untuk calon peserta."
                      action={
                        <Button icon="bi-plus-lg" onClick={() => handleOpenModal()}>
                          Tambah Pertanyaan
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {fields.map((field) => (
                      <div
                        key={field.id}
                        className="px-5 py-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:items-center">
                          <div className="md:col-span-5 flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                              <i className={`bi ${getIconForType(field.field_type)} text-base`} aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
                                {field.label}
                              </h4>
                              {field.placeholder && (
                                <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                  Placeholder: {field.placeholder}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="md:col-span-3">
                            <Badge
                              variant={
                                field.field_type === 'select' || field.field_type === 'radio'
                                  ? "primary"
                                  : "info"
                              }
                              size="sm"
                            >
                              {field.field_type}
                            </Badge>
                          </div>

                          <div className="md:col-span-2">
                            {field.is_required ? (
                              <Badge variant="danger" size="sm" dot>
                                Wajib
                              </Badge>
                            ) : (
                              <Badge variant="secondary" size="sm">
                                Opsional
                              </Badge>
                            )}
                          </div>

                          <div className="md:col-span-2 flex md:justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              icon="bi-pencil-square"
                              onClick={() => handleOpenModal(field)}
                              aria-label="Edit pertanyaan"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              icon="bi-trash"
                              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400"
                              onClick={() => handleDeleteField(field.id)}
                              aria-label="Hapus pertanyaan"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </>
        )}

        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={isEditing ? 'Edit Pertanyaan' : 'Buat Pertanyaan Baru'}
          size="lg"
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                form="field-form"
                loading={saveLoading}
                icon="bi-save"
              >
                Simpan
              </Button>
            </>
          }
        >
          <form id="field-form" onSubmit={handleSaveField} className="space-y-4">
            <Input
              label="Label Pertanyaan"
              required
              value={formData.label}
              onChange={e => setFormData({...formData, label: e.target.value})}
              placeholder="Contoh: Instansi asal / Motivasi"
            />

            <Select
              label="Tipe Inputan"
              required
              options={FIELD_TYPE_OPTIONS}
              value={formData.field_type}
              onChange={e => setFormData({...formData, field_type: e.target.value})}
            />

            {(formData.field_type === 'select' || formData.field_type === 'radio') && (
              <Input
                label="Pilihan Opsi"
                required
                value={formData.options}
                onChange={e => setFormData({...formData, options: e.target.value})}
                placeholder="Pisahkan dengan koma. Contoh: Sesi 1, Sesi 2"
                helper="Pisahkan masing-masing pilihan menggunakan tanda koma (,)."
              />
            )}

            <Input
              label="Placeholder Input"
              value={formData.placeholder}
              onChange={e => setFormData({...formData, placeholder: e.target.value})}
              placeholder="Teks bantuan (opsional)"
            />

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <input
                type="checkbox"
                id="req"
                checked={formData.is_required}
                onChange={e => setFormData({...formData, is_required: e.target.checked})}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="req" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                Wajib diisi oleh peserta
              </label>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
