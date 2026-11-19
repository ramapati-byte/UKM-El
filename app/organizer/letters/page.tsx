"use client";

import { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/shell/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import { letterService } from "@/services/letter.service";
import type {
  LetterEntity,
  LetterQuery,
  LetterType,
  LetterPriority,
  LetterTemplate,
  LetterStatus,
} from "@/types/letter";
import type { BadgeVariant } from "@/types/common";
import { formatDateShort } from "@/lib/format";

const statusVariantMap: Record<string, BadgeVariant> = {
  draft: "secondary",
  diajukan: "info",
  disetujui: "success",
  ditolak: "danger",
  diarsip: "secondary",
};

const statusLabelMap: Record<string, string> = {
  draft: "Draft",
  diajukan: "Diajukan",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
  diarsip: "Diarsip",
};

const priorityVariantMap: Record<string, BadgeVariant> = {
  rendah: "secondary",
  normal: "info",
  tinggi: "warning",
  urgent: "danger",
};

export default function LettersPage() {
  const [letters, setLetters] = useState<LetterEntity[]>([]);
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    jenis: LetterType;
    perihal: string;
    tanggalSurat: string;
    tujuan: string;
    prioritas: LetterPriority;
    templateId?: string;
  }>({
    jenis: "surat_keluar",
    perihal: "",
    tanggalSurat: new Date().toISOString().split("T")[0],
    tujuan: "",
    prioritas: "normal",
  });
  const [query, setQuery] = useState<LetterQuery>({
    page: 1,
    limit: 10,
    search: "",
    jenis: "all",
    status: "all",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await letterService.list(query);
      setLetters(res.data);
      setTotal(res.total);
      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat data surat";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const handleTemplateChange = (tmplId: string) => {
    const tmpl = templates.find((t) => t.id === tmplId);
    if (tmpl) {
      setForm((prev) => ({
        ...prev,
        templateId: tmplId,
        perihal: tmpl.nama,
      }));
    } else {
      setForm((prev) => ({ ...prev, templateId: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await letterService.create({
        jenis: form.jenis,
        perihal: form.perihal,
        tanggalSurat: form.tanggalSurat,
        tujuan: form.tujuan || undefined,
        prioritas: form.prioritas,
      });
      setOpen(false);
      setForm({
        jenis: "surat_keluar",
        perihal: "",
        tanggalSurat: new Date().toISOString().split("T")[0],
        tujuan: "",
        prioritas: "normal",
      });
      load();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal membuat surat";
      setError(message);
    }
  };

  const totalPages = Math.ceil(total / (query.limit || 10)) || 1;

  return (
    <AppShell title="Surat Menyurat" subtitle="Kelola surat masuk dan keluar UKM">
      <div className="space-y-6">
        <PageHeader
          title="Daftar Surat"
          actions={
            <Button onClick={() => setOpen(true)}>
              <i className="bi bi-plus-circle mr-1.5" aria-hidden="true" /> Buat Surat
            </Button>
          }
        />

        {/* Filter bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Pencarian
              </label>
              <Input
                placeholder="Cari perihal atau nomor..."
                value={query.search || ""}
                onChange={(e) =>
                  setQuery((q) => ({ ...q, search: e.target.value, page: 1 }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Jenis Surat
              </label>
              <Select
                value={query.jenis || "all"}
                onChange={(v: string) =>
                  setQuery((q) => ({ ...q, jenis: v as LetterType | "all", page: 1 }))
                }
              >
                <option value="all">Semua Jenis</option>
                <option value="surat_keluar">Surat Keluar</option>
                <option value="surat_masuk">Surat Masuk</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Status
              </label>
              <Select
                value={query.status || "all"}
                onChange={(v: string) =>
                  setQuery((q) => ({ ...q, status: v as LetterStatus | "all", page: 1 }))
                }
              >
                <option value="all">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="diajukan">Diajukan</option>
                <option value="disetujui">Disetujui</option>
                <option value="ditolak">Ditolak</option>
                <option value="diarsip">Diarsip</option>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  setQuery({
                    page: 1,
                    limit: 10,
                    search: "",
                    jenis: "all",
                    status: "all",
                  })
                }
              >
                <i className="bi bi-arrow-counterclockwise mr-1.5" aria-hidden="true" />
                Reset Filter
              </Button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-danger mb-4">{error}</p>
            <Button onClick={load}>Coba Lagi</Button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <DataTable
              loading={loading}
              columns={[
                {
                  key: "nomorSurat",
                  label: "Nomor Surat",
                  render: (row) => (
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {row.nomorSurat}
                    </span>
                  ),
                },
                {
                  key: "jenis",
                  label: "Jenis",
                  render: (row) => (
                    <Badge variant={row.jenis === "surat_masuk" ? "info" : "primary"}>
                      {row.jenis === "surat_masuk" ? "Surat Masuk" : "Surat Keluar"}
                    </Badge>
                  ),
                },
                {
                  key: "perihal",
                  label: "Perihal",
                  render: (row) => (
                    <div className="max-w-xs">
                      <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {row.perihal}
                      </p>
                      {row.tujuan && (
                        <p className="text-xs text-slate-500 truncate">
                          Tujuan: {row.tujuan}
                        </p>
                      )}
                    </div>
                  ),
                },
                {
                  key: "prioritas",
                  label: "Prioritas",
                  render: (row) => (
                    <Badge variant={priorityVariantMap[row.prioritas] ?? "secondary"} size="sm">
                      {row.prioritas}
                    </Badge>
                  ),
                },
                {
                  key: "status",
                  label: "Status",
                  render: (row) => (
                    <Badge
                      variant={statusVariantMap[row.status] ?? "secondary"}
                      dot
                    >
                      {statusLabelMap[row.status] ?? row.status}
                    </Badge>
                  ),
                },
                {
                  key: "tanggalSurat",
                  label: "Tanggal",
                  render: (row) => formatDateShort(row.tanggalSurat),
                },
              ]}
              data={letters}
              rowActions={[
                {
                  label: "Detail",
                  onClick: (row) => {
                    window.location.href = `/organizer/letters/${row.id}`;
                  },
                },
              ]}
            />

            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  Total {total} surat
                </span>
                <Pagination
                  currentPage={query.page || 1}
                  totalPages={totalPages}
                  onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
                />
              </div>
            )}
          </div>
        )}

        {/* Modal Buat Surat */}
        <Modal open={open} onClose={() => setOpen(false)} title="Buat Surat Baru">
          <form onSubmit={handleSubmit} className="space-y-4">
            {templates.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Gunakan Template (Opsional)
                </label>
                <Select
                  value={form.templateId || ""}
                  onChange={handleTemplateChange}
                >
                  <option value="">-- Pilih Template --</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama} ({t.kode})
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jenis Surat *
              </label>
              <Select
                value={form.jenis}
                onChange={(v: string) =>
                  setForm({ ...form, jenis: v as LetterType })
                }
              >
                <option value="surat_keluar">Surat Keluar</option>
                <option value="surat_masuk">Surat Masuk</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Perihal Surat *
              </label>
              <Input
                value={form.perihal}
                onChange={(e) =>
                  setForm({ ...form, perihal: e.target.value })
                }
                placeholder="Contoh: Permohonan Peminjaman Ruang Aula"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {form.jenis === "surat_keluar" ? "Tujuan Surat" : "Pengirim Surat"}
              </label>
              <Input
                value={form.tujuan}
                onChange={(e) => setForm({ ...form, tujuan: e.target.value })}
                placeholder={
                  form.jenis === "surat_keluar"
                    ? "Contoh: Bagian Kemahasiswaan"
                    : "Contoh: BEM El Rahma"
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Surat *
                </label>
                <Input
                  type="date"
                  value={form.tanggalSurat}
                  onChange={(e) =>
                    setForm({ ...form, tanggalSurat: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Prioritas
                </label>
                <Select
                  value={form.prioritas}
                  onChange={(v: string) =>
                    setForm({ ...form, prioritas: v as LetterPriority })
                  }
                >
                  <option value="rendah">Rendah</option>
                  <option value="normal">Normal</option>
                  <option value="tinggi">Tinggi</option>
                  <option value="urgent">Urgent</option>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit">
                <i className="bi bi-save mr-1.5" aria-hidden="true" /> Simpan Surat
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
