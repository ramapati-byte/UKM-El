"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { announcementService } from "@/services/announcement.service";
import type { AnnouncementEntity, AnnouncementQuery } from "@/types/announcement";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementEntity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ judul: "", isi: "", audience: "ukm", tanggalMulai: "", tanggalBerakhir: "" });
  const [query, setQuery] = useState<AnnouncementQuery>({ page: 1, limit: 10 });

  useEffect(() => { load(); }, [query]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await announcementService.list(query);
      setAnnouncements(res.data);
      setTotal(res.total);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data pengumuman");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await announcementService.create({
        judul: form.judul,
        isi: form.isi,
        audience: form.audience as any,
        tanggalMulai: form.tanggalMulai,
        tanggalBerakhir: form.tanggalBerakhir,
        isActive: true,
      });
      setOpen(false);
      setForm({ judul: "", isi: "", audience: "ukm", tanggalMulai: "", tanggalBerakhir: "" });
      load();
    } catch (err: any) {
      setError(err.message || "Gagal membuat pengumuman");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin hapus pengumuman ini?")) return;
    try {
      await announcementService.delete(id);
      load();
    } catch (err: any) {
      setError(err.message || "Gagal menghapus pengumuman");
    }
  };

  if (loading) return (<AppShell title="Pengumuman"><div className="flex items-center justify-center min-h-[400px]">Memuat data...</div></AppShell>);
  if (error) return (<AppShell title="Pengumuman"><div className="p-6 text-center"><p className="text-danger">{error}</p><Button onClick={load}>Coba Lagi</Button></div></AppShell>);

  return (
    <AppShell title="Pengumuman" subtitle="CRUD pengumuman internal dan global">
      <PageHeader title="Daftar Pengumuman" actions={<Button onClick={() => setOpen(true)}>+ Tambah Pengumuman</Button>} />
      <DataTable
        columns={[
          { key: "judul", label: "Judul" },
          { key: "audience", label: "Audience" },
          { key: "isActive", label: "Status" },
          { key: "tanggalMulai", label: "Mulai" },
          { key: "tanggalBerakhir", label: "Berakhir" },
        ]}
        data={announcements.map((a) => ({
          id: a.id,
          judul: a.judul,
          audience: a.audience,
          isActive: a.isActive ? "Aktif" : "Nonaktif",
          tanggalMulai: a.tanggalMulai,
          tanggalBerakhir: a.tanggalBerakhir,
        }))}
        rowActions={[
          { label: "Hapus", onClick: (row: any) => handleDelete(row.id), variant: "danger" },
        ]}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Tambah Pengumuman">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Judul</label>
            <Input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Isi</label>
            <Input value={form.isi} onChange={(e) => setForm({ ...form, isi: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Audience</label>
            <Select value={form.audience} onChange={(v) => setForm({ ...form, audience: v })}>
              <option value="semua">Semua</option>
              <option value="ukm">UKM</option>
              <option value="divisi">Divisi</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Mulai</label>
            <Input type="date" value={form.tanggalMulai} onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Berakhir</label>
            <Input type="date" value={form.tanggalBerakhir} onChange={(e) => setForm({ ...form, tanggalBerakhir: e.target.value })} required />
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}