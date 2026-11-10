"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { documentService } from "@/services/document.service";
import type { DocumentEntity, DocumentQuery } from "@/types/document";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentEntity[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ judul: "", tipe: "lainnya", folderId: "", deskripsi: "" });
  const [query, setQuery] = useState<DocumentQuery>({ page: 1, limit: 10 });

  useEffect(() => { load(); }, [query]);

  const load = async () => {
    setLoading(true);
    try {
      const [docsRes, foldersRes] = await Promise.all([
        documentService.listDocuments(query),
        documentService.listFolders(),
      ]);
      setDocuments(docsRes.data);
      setFolders(foldersRes);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data dokumen");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("judul", form.judul);
    fd.append("tipe", form.tipe);
    fd.append("folderId", form.folderId);
    fd.append("deskripsi", form.deskripsi);
    try {
      await documentService.upload(fd);
      setOpen(false);
      setForm({ judul: "", tipe: "lainnya", folderId: "", deskripsi: "" });
      load();
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah dokumen");
    }
  };

  if (loading) return (<AppShell title="Dokumen"><div className="flex items-center justify-center min-h-[400px]">Memuat data...</div></AppShell>);
  if (error) return (<AppShell title="Dokumen"><div className="p-6 text-center"><p className="text-danger">{error}</p><Button onClick={load}>Coba Lagi</Button></div></AppShell>);

  return (
    <AppShell title="Dokumen & Arsip" subtitle="Kelola dokumen UKM">
      <PageHeader title="Daftar Dokumen" actions={<Button onClick={() => setOpen(true)}>+ Unggah Dokumen</Button>} />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Folder</h3>
            <ul className="space-y-1">
              {folders.map((f) => (
                <li key={f.id} className="text-sm text-slate-600 dark:text-slate-400">
                  <i className="bi bi-folder mr-2"></i>
                  {f.nama}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="md:col-span-3">
          <DataTable
            columns={[
              { key: "judul", label: "Judul" },
              { key: "tipe", label: "Tipe" },
              { key: "versi", label: "Versi" },
              { key: "ukuranFile", label: "Ukuran" },
              { key: "diunggahOleh", label: "Diunggah Oleh" },
              { key: "diunggahPada", label: "Tanggal" },
            ]}
            data={documents.map((d) => ({
              id: d.id,
              judul: d.judul,
              tipe: d.tipe,
              versi: d.versi,
              ukuranFile: `${(d.ukuranFile / 1024 / 1024).toFixed(2)} MB`,
              diunggahOleh: d.diunggahOleh,
              diunggahPada: d.diunggahPada,
            }))}
            rowActions={[]}
          />
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Unggah Dokumen Baru">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Judul</label>
            <Input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipe</label>
            <Select value={form.tipe} onChange={(v) => setForm({ ...form, tipe: v })}>
              <option value="surat">Surat</option>
              <option value="laporan">Laporan</option>
              <option value="proker">Proker</option>
              <option value="keuangan">Keuangan</option>
              <option value="kepengurusan">Kepengurusan</option>
              <option value="lainnya">Lainnya</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Folder</label>
            <Select value={form.folderId} onChange={(v) => setForm({ ...form, folderId: v })}>
              <option value="">Pilih Folder</option>
              {folders.map((f) => (<option key={f.id} value={f.id}>{f.nama}</option>))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi</label>
            <Input value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}