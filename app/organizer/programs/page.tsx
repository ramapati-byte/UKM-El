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
import { programService } from "@/services/program.service";
import type { ProgramEntity, ProgramQuery, ProgramStatus } from "@/types/program";
import type { BadgeVariant } from "@/types/common";

const statusVariantMap: Record<ProgramStatus, BadgeVariant> = {
  draft: "secondary",
  aktif: "success",
  selesai: "primary",
  dibatalkan: "danger",
};

const statusLabelMap: Record<ProgramStatus, string> = {
  draft: "Draft",
  aktif: "Aktif",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramEntity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal create
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    deskripsi: "",
    periode: "2026/2027",
    target: "",
    satuan: "kegiatan",
    divisi: "",
    tanggalMulai: "",
    tanggalSelesai: "",
  });

  // Modal update progress
  const [openProgress, setOpenProgress] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<ProgramEntity | null>(
    null
  );
  const [progressVal, setProgressVal] = useState<number>(0);
  const [progressNote, setProgressNote] = useState("");

  const [query, setQuery] = useState<ProgramQuery>({
    page: 1,
    limit: 10,
    search: "",
    status: "all",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await programService.list(query);
      setPrograms(res.data);
      setTotal(res.total);
      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat data program";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await programService.create({
        nama: form.nama,
        deskripsi: form.deskripsi,
        periode: form.periode,
        target: Number(form.target),
        realisasi: 0,
        satuan: form.satuan,
        status: "aktif",
        ukmId: "ukm-bem",
        divisi: form.divisi,
        tanggalMulai: form.tanggalMulai,
        tanggalSelesai: form.tanggalSelesai,
        createdBy: "user-001",
      });
      setOpenCreate(false);
      setForm({
        nama: "",
        deskripsi: "",
        periode: "2026/2027",
        target: "",
        satuan: "kegiatan",
        divisi: "",
        tanggalMulai: "",
        tanggalSelesai: "",
      });
      load();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal membuat program";
      alert(message);
    }
  };

  const handleOpenProgress = (prog: ProgramEntity) => {
    setSelectedProgram(prog);
    setProgressVal(prog.realisasi);
    setProgressNote("");
    setOpenProgress(true);
  };

  const handleProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;
    try {
      await programService.updateProgress(
        selectedProgram.id,
        Number(progressVal),
        progressNote || undefined
      );
      setOpenProgress(false);
      setSelectedProgram(null);
      load();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memperbarui progres";
      alert(message);
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus program kerja "${nama}"?`)) return;
    try {
      await programService.delete(id);
      load();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menghapus program";
      alert(message);
    }
  };

  const totalPages = Math.ceil(total / (query.limit || 10)) || 1;

  return (
    <AppShell
      title="Program Kerja"
      subtitle="Penyusunan dan monitoring proker per periode"
      breadcrumbs={[
        { label: "Dashboard", href: "/organizer/dashboard" },
        { label: "Program Kerja" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Daftar Program Kerja"
          actions={
            <Button onClick={() => setOpenCreate(true)}>
              <i className="bi bi-plus-circle mr-1.5" aria-hidden="true" /> Tambah Proker
            </Button>
          }
        />

        {/* Filter bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Pencarian
              </label>
              <Input
                placeholder="Cari program kerja..."
                value={query.search || ""}
                onChange={(e) =>
                  setQuery((q) => ({ ...q, search: e.target.value, page: 1 }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Status
              </label>
              <Select
                value={query.status || "all"}
                onChange={(v: string) =>
                  setQuery((q) => ({ ...q, status: v as ProgramStatus | "all", page: 1 }))
                }
              >
                <option value="all">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="aktif">Aktif</option>
                <option value="selesai">Selesai</option>
                <option value="dibatalkan">Dibatalkan</option>
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
                  key: "nama",
                  label: "Nama Program",
                  render: (row) => (
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {row.nama}
                      </p>
                      {row.divisi && (
                        <p className="text-xs text-slate-500">
                          Divisi: {row.divisi}
                        </p>
                      )}
                    </div>
                  ),
                },
                {
                  key: "periode",
                  label: "Periode",
                  render: (row) => (
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {row.periode}
                    </span>
                  ),
                },
                {
                  key: "progres",
                  label: "Progres & Realisasi",
                  render: (row) => {
                    const percent =
                      row.target > 0
                        ? Math.min(100, Math.round((row.realisasi / row.target) * 100))
                        : 0;
                    return (
                      <div className="w-44 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {row.realisasi} / {row.target} {row.satuan}
                          </span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                            {percent}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  },
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
              ]}
              data={programs}
              rowActions={[
                {
                  label: "Update Progres",
                  onClick: (row) => handleOpenProgress(row),
                },
                {
                  label: "Hapus",
                  variant: "danger",
                  onClick: (row) => handleDelete(row.id, row.nama),
                },
              ]}
            />

            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  Total {total} program kerja
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

        {/* Modal Tambah Proker */}
        <Modal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          title="Tambah Program Kerja Baru"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Program *
              </label>
              <Input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Contoh: Seminar Nasional Teknologi & AI"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deskripsi
              </label>
              <Input
                value={form.deskripsi}
                onChange={(e) =>
                  setForm({ ...form, deskripsi: e.target.value })
                }
                placeholder="Tujuan atau gambaran umum kegiatan"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Periode *
                </label>
                <Input
                  value={form.periode}
                  onChange={(e) =>
                    setForm({ ...form, periode: e.target.value })
                  }
                  placeholder="2026/2027"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Divisi Penanggung Jawab
                </label>
                <Input
                  value={form.divisi}
                  onChange={(e) =>
                    setForm({ ...form, divisi: e.target.value })
                  }
                  placeholder="Contoh: R&D, Humas"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Capaian *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={form.target}
                  onChange={(e) =>
                    setForm({ ...form, target: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Satuan Target
                </label>
                <Input
                  value={form.satuan}
                  onChange={(e) =>
                    setForm({ ...form, satuan: e.target.value })
                  }
                  placeholder="peserta / kegiatan / modul"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Mulai *
                </label>
                <Input
                  type="date"
                  value={form.tanggalMulai}
                  onChange={(e) =>
                    setForm({ ...form, tanggalMulai: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Selesai *
                </label>
                <Input
                  type="date"
                  value={form.tanggalSelesai}
                  onChange={(e) =>
                    setForm({ ...form, tanggalSelesai: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenCreate(false)}
              >
                Batal
              </Button>
              <Button type="submit">
                <i className="bi bi-save mr-1.5" aria-hidden="true" /> Simpan Proker
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal Update Progres */}
        <Modal
          open={openProgress}
          onClose={() => setOpenProgress(false)}
          title={`Update Progres: ${selectedProgram?.nama ?? ""}`}
        >
          <form onSubmit={handleProgressSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Realisasi Saat Ini ({selectedProgram?.satuan})
              </label>
              <Input
                type="number"
                min="0"
                value={progressVal}
                onChange={(e) => setProgressVal(Number(e.target.value))}
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Target keseluruhan: {selectedProgram?.target}{" "}
                {selectedProgram?.satuan}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan Evaluasi / Keterangan
              </label>
              <Input
                value={progressNote}
                onChange={(e) => setProgressNote(e.target.value)}
                placeholder="Contoh: Realisasi tahap 1 telah selesai"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenProgress(false)}
              >
                Batal
              </Button>
              <Button type="submit">
                <i className="bi bi-check2 mr-1.5" aria-hidden="true" /> Simpan Progres
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
