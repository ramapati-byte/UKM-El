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
import { announcementService } from "@/services/announcement.service";
import type {
  AnnouncementEntity,
  AnnouncementQuery,
  AnnouncementAudience,
} from "@/types/announcement";
import { formatDateShort } from "@/lib/format";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementEntity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState<{
    judul: string;
    isi: string;
    audience: AnnouncementAudience;
    tanggalMulai: string;
    tanggalBerakhir: string;
  }>({
    judul: "",
    isi: "",
    audience: "ukm",
    tanggalMulai: new Date().toISOString().split("T")[0],
    tanggalBerakhir: "",
  });

  const [query, setQuery] = useState<AnnouncementQuery>({
    page: 1,
    limit: 10,
    search: "",
    audience: "all",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await announcementService.list(query);
      setAnnouncements(res.data);
      setTotal(res.total);
      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat data pengumuman";
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
      await announcementService.create({
        judul: form.judul,
        isi: form.isi,
        audience: form.audience,
        tanggalMulai: form.tanggalMulai,
        tanggalBerakhir: form.tanggalBerakhir,
        isActive: true,
      });
      setOpen(false);
      setForm({
        judul: "",
        isi: "",
        audience: "ukm",
        tanggalMulai: new Date().toISOString().split("T")[0],
        tanggalBerakhir: "",
      });
      load();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal membuat pengumuman";
      alert(message);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await announcementService.toggleActive(id);
      load();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mengubah status";
      alert(message);
    }
  };

  const handleDelete = async (id: string, judul: string) => {
    if (!confirm(`Hapus pengumuman "${judul}"?`)) return;
    try {
      await announcementService.delete(id);
      load();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menghapus pengumuman";
      alert(message);
    }
  };

  const totalPages = Math.ceil(total / (query.limit || 10)) || 1;

  return (
    <AppShell
      title="Pengumuman"
      subtitle="Publikasi pengumuman internal UKM dan pengumuman global"
      breadcrumbs={[
        { label: "Dashboard", href: "/organizer/dashboard" },
        { label: "Pengumuman" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Daftar Pengumuman"
          actions={
            <Button onClick={() => setOpen(true)}>
              <i className="bi bi-megaphone mr-1.5" aria-hidden="true" /> Tambah Pengumuman
            </Button>
          }
        />

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Pencarian
              </label>
              <Input
                placeholder="Cari pengumuman..."
                value={query.search || ""}
                onChange={(e) =>
                  setQuery((q) => ({ ...q, search: e.target.value, page: 1 }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Target Sasaran
              </label>
              <Select
                value={query.audience || "all"}
                onChange={(v: string) =>
                  setQuery((q) => ({ ...q, audience: v as AnnouncementAudience | "all", page: 1 }))
                }
              >
                <option value="all">Semua Sasaran</option>
                <option value="semua">Semua Mahasiswa (Global)</option>
                <option value="ukm">Internal UKM</option>
                <option value="divisi">Internal Pengurus/Divisi</option>
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
                    audience: "all",
                  })
                }
              >
                <i className="bi bi-arrow-counterclockwise mr-1.5" aria-hidden="true" />
                Reset
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
                  key: "judul",
                  label: "Judul Pengumuman",
                  render: (row) => (
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {row.judul}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1 max-w-md">
                        {row.isi}
                      </p>
                    </div>
                  ),
                },
                {
                  key: "audience",
                  label: "Target Sasaran",
                  render: (row) => (
                    <Badge
                      variant={
                        row.audience === "semua"
                          ? "primary"
                          : row.audience === "ukm"
                          ? "info"
                          : "secondary"
                      }
                    >
                      {row.audience === "semua"
                        ? "Global (Semua)"
                        : row.audience === "ukm"
                        ? "Internal UKM"
                        : "Divisi"}
                    </Badge>
                  ),
                },
                {
                  key: "isActive",
                  label: "Status",
                  render: (row) => (
                    <Badge variant={row.isActive ? "success" : "secondary"} dot>
                      {row.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  ),
                },
                {
                  key: "tanggalMulai",
                  label: "Periode Tayang",
                  render: (row) => (
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {formatDateShort(row.tanggalMulai)} s/d{" "}
                      {formatDateShort(row.tanggalBerakhir)}
                    </span>
                  ),
                },
              ]}
              data={announcements}
              rowActions={[
                {
                  label: (row) => (row.isActive ? "Nonaktifkan" : "Aktifkan"),
                  onClick: (row) => handleToggle(row.id),
                },
                {
                  label: "Hapus",
                  variant: "danger",
                  onClick: (row) => handleDelete(row.id, row.judul),
                },
              ]}
            />

            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  Total {total} pengumuman
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

        {/* Modal Tambah Pengumuman */}
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Tambah Pengumuman Baru"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Judul Pengumuman *
              </label>
              <Input
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                placeholder="Contoh: Jadwal Rapat Koordinasi Mingguan"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Isi Pengumuman *
              </label>
              <textarea
                value={form.isi}
                onChange={(e) => setForm({ ...form, isi: e.target.value })}
                rows={4}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Tuliskan isi pengumuman secara rinci..."
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Sasaran *
              </label>
              <Select
                value={form.audience}
                onChange={(v: string) =>
                  setForm({ ...form, audience: v as AnnouncementAudience })
                }
              >
                <option value="ukm">Internal Anggota UKM</option>
                <option value="divisi">Internal Pengurus Divisi</option>
                <option value="semua">Semua Mahasiswa (Publik Kampus)</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Mulai Tayang *
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
                  Tanggal Selesai Tayang *
                </label>
                <Input
                  type="date"
                  value={form.tanggalBerakhir}
                  onChange={(e) =>
                    setForm({ ...form, tanggalBerakhir: e.target.value })
                  }
                  required
                />
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
                <i className="bi bi-broadcast mr-1.5" aria-hidden="true" />
                Publikasikan
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
