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
import { documentService } from "@/services/document.service";
import type {
  DocumentEntity,
  DocumentQuery,
  DocumentFolder,
  DocumentType,
} from "@/types/document";
import type { BadgeVariant } from "@/types/common";
import { formatDateShort } from "@/lib/format";

const docTypeVariantMap: Record<DocumentType, BadgeVariant> = {
  surat: "primary",
  laporan: "info",
  proker: "success",
  keuangan: "warning",
  kepengurusan: "secondary",
  lainnya: "secondary",
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentEntity[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");

  const [form, setForm] = useState<{
    judul: string;
    tipe: DocumentType;
    folderId: string;
    deskripsi: string;
  }>({
    judul: "",
    tipe: "lainnya",
    folderId: "",
    deskripsi: "",
  });

  const [query, setQuery] = useState<DocumentQuery>({
    page: 1,
    limit: 10,
    search: "",
    tipe: "all",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q: DocumentQuery = {
        ...query,
        folderId: selectedFolderId || undefined,
      };
      const [docsRes, foldersRes] = await Promise.all([
        documentService.listDocuments(q),
        documentService.listFolders(),
      ]);
      setDocuments(docsRes.data);
      setTotal(docsRes.total);
      setFolders(foldersRes);
      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat data dokumen";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [query, selectedFolderId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("judul", form.judul);
    fd.append("tipe", form.tipe);
    if (form.folderId) fd.append("folderId", form.folderId);
    if (form.deskripsi) fd.append("deskripsi", form.deskripsi);

    try {
      await documentService.upload(fd);
      setOpen(false);
      setForm({ judul: "", tipe: "lainnya", folderId: "", deskripsi: "" });
      load();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mengunggah dokumen";
      alert(message);
    }
  };

  const handleDownload = async (id: string, judul: string) => {
    try {
      const blob = await documentService.download(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${judul}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mengunduh file";
      alert(message);
    }
  };

  const handleDelete = async (id: string, judul: string) => {
    if (!confirm(`Hapus dokumen "${judul}"?`)) return;
    try {
      await documentService.delete(id);
      load();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menghapus dokumen";
      alert(message);
    }
  };

  const totalPages = Math.ceil(total / (query.limit || 10)) || 1;

  return (
    <AppShell
      title="Dokumen & Arsip"
      subtitle="Repositori dokumen resmi dan arsip kegiatan UKM"
      breadcrumbs={[
        { label: "Dashboard", href: "/organizer/dashboard" },
        { label: "Dokumen & Arsip" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Daftar Dokumen"
          actions={
            <Button onClick={() => setOpen(true)}>
              <i className="bi bi-cloud-arrow-up mr-1.5" aria-hidden="true" /> Unggah Dokumen
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar Folder */}
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Kategori Folder
              </h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setSelectedFolderId("")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      selectedFolderId === ""
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <i className="bi bi-folder2-open" aria-hidden="true" /> Semua Folder
                    </span>
                  </button>
                </li>
                {folders.map((f) => (
                  <li key={f.id}>
                    <button
                      onClick={() => setSelectedFolderId(f.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        selectedFolderId === f.id
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <i className="bi bi-folder" aria-hidden="true" /> {f.nama}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Konten Dokumen */}
          <div className="md:col-span-8 lg:col-span-9 space-y-4">
            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Pencarian
                  </label>
                  <Input
                    placeholder="Cari judul dokumen..."
                    value={query.search || ""}
                    onChange={(e) =>
                      setQuery((q) => ({ ...q, search: e.target.value, page: 1 }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Tipe Dokumen
                  </label>
                  <Select
                    value={query.tipe || "all"}
                    onChange={(v: string) =>
                      setQuery((q) => ({ ...q, tipe: v as DocumentType | "all", page: 1 }))
                    }
                  >
                    <option value="all">Semua Tipe</option>
                    <option value="surat">Surat</option>
                    <option value="laporan">Laporan</option>
                    <option value="proker">Proker</option>
                    <option value="keuangan">Keuangan</option>
                    <option value="kepengurusan">Kepengurusan</option>
                    <option value="lainnya">Lainnya</option>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedFolderId("");
                      setQuery({
                        page: 1,
                        limit: 10,
                        search: "",
                        tipe: "all",
                      });
                    }}
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
                      label: "Judul Dokumen",
                      render: (row) => (
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {row.judul}
                          </p>
                          {row.deskripsi && (
                            <p className="text-xs text-slate-500 truncate max-w-sm">
                              {row.deskripsi}
                            </p>
                          )}
                        </div>
                      ),
                    },
                    {
                      key: "tipe",
                      label: "Tipe",
                      render: (row) => (
                        <Badge variant={docTypeVariantMap[row.tipe] ?? "secondary"}>
                          {row.tipe}
                        </Badge>
                      ),
                    },
                    {
                      key: "versi",
                      label: "Versi",
                      align: "center",
                      render: (row) => `v${row.versi}`,
                    },
                    {
                      key: "ukuranFile",
                      label: "Ukuran",
                      render: (row) => `${(row.ukuranFile / 1024 / 1024).toFixed(2)} MB`,
                    },
                    {
                      key: "diunggahPada",
                      label: "Tanggal",
                      render: (row) => formatDateShort(row.diunggahPada),
                    },
                  ]}
                  data={documents}
                  rowActions={[
                    {
                      label: "Unduh",
                      onClick: (row) => handleDownload(row.id, row.judul),
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
                      Total {total} dokumen
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
          </div>
        </div>

        {/* Modal Unggah Dokumen */}
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Unggah Dokumen Baru"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Judul Dokumen *
              </label>
              <Input
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                placeholder="Contoh: Proposal Kegiatan Festival Seni 2026"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tipe Dokumen *
                </label>
                <Select
                  value={form.tipe}
                  onChange={(v: string) =>
                    setForm({ ...form, tipe: v as DocumentType })
                  }
                >
                  <option value="surat">Surat</option>
                  <option value="laporan">Laporan</option>
                  <option value="proker">Proker</option>
                  <option value="keuangan">Keuangan</option>
                  <option value="kepengurusan">Kepengurusan</option>
                  <option value="lainnya">Lainnya</option>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Folder Tujuan
                </label>
                <Select
                  value={form.folderId}
                  onChange={(v: string) => setForm({ ...form, folderId: v })}
                >
                  <option value="">-- Tanpa Folder --</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nama}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                File Dokumen (PDF, DOCX, ZIP max 10MB)
              </label>
              <input
                type="file"
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950 dark:file:text-indigo-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deskripsi Dokumen
              </label>
              <Input
                value={form.deskripsi}
                onChange={(e) =>
                  setForm({ ...form, deskripsi: e.target.value })
                }
                placeholder="Catatan atau deskripsi ringkas"
              />
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
                <i className="bi bi-upload mr-1.5" aria-hidden="true" /> Unggah
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
