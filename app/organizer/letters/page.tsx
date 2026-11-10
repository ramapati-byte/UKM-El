"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { letterService } from "@/services/letter.service";
import type { LetterEntity, LetterQuery } from "@/types/letter";

export default function LettersPage() {
  const [letters, setLetters] = useState<LetterEntity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ jenis: "surat_keluar", perihal: "", tanggalSurat: "", tujuan: "", prioritas: "normal" });
  const [query, setQuery] = useState<LetterQuery>({ page: 1, limit: 10 });

  useEffect(() => { load(); }, [query]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await letterService.list(query);
      setLetters(res.data);
      setTotal(res.total);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data surat");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await letterService.create({
        jenis: form.jenis as any,
        perihal: form.perihal,
        tanggalSurat: form.tanggalSurat,
        tujuan: form.tujuan || undefined,
        prioritas: form.prioritas as any,
      });
      setOpen(false);
      setForm({ jenis: "surat_keluar", perihal: "", tanggalSurat: "", tujuan: "", prioritas: "normal" });
      load();
    } catch (err: any) {
      setError(err.message || "Gagal membuat surat");
    }
  };

  if (loading) return (<AppShell title="Surat Menyurat"><div className="flex items-center justify-center min-h-[400px]">Memuat data...</div></AppShell>);
  if (error) return (<AppShell title="Surat Menyurat"><div className="p-6 text-center"><p className="text-danger">{error}</p><Button onClick={load}>Coba Lagi</Button></div></AppShell>);

  return (
    <AppShell title="Surat Menyurat" subtitle="Kelola surat masuk dan keluar UKM">
      <PageHeader title="Daftar Surat" actions={<Button onClick={() => setOpen(true)}>+ Buat Surat</Button>} />
      <DataTable
        columns={[
          { key: "nomorSurat", label: "Nomor Surat" },
          { key: "jenis", label: "Jenis" },
          { key: "perihal", label: "Perihal" },
          { key: "status", label: "Status" },
          { key: "tanggalSurat", label: "Tanggal" },
        ]}
        data={letters.map((l) => ({
          id: l.id,
          nomorSurat: l.nomorSurat,
          jenis: l.jenis === "surat_masuk" ? "Masuk" : "Keluar",
          perihal: l.perihal,
          status: l.status,
          tanggalSurat: l.tanggalSurat,
        }))}
        rowActions={[
          {
            label: "Detail",
            onClick: (row: any) => window.location.href = `/organizer/letters/${row.id}`,
          },
        ]}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Buat Surat Baru">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jenis Surat</label>
            <Select value={form.jenis} onChange={(v) => setForm({ ...form, jenis: v })}>
              <option value="surat_keluar">Surat Keluar</option>
              <option value="surat_masuk">Surat Masuk</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Perihal</label>
            <Input value={form.perihal} onChange={(e) => setForm({ ...form, perihal: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tujuan/Pengirim</label>
            <Input value={form.tujuan} onChange={(e) => setForm({ ...form, tujuan: e.target.value })} placeholder="Nama tujuan atau pengirim" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Surat</label>
            <Input type="date" value={form.tanggalSurat} onChange={(e) => setForm({ ...form, tanggalSurat: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prioritas</label>
            <Select value={form.prioritas} onChange={(v) => setForm({ ...form, prioritas: v })}>
              <option value="rendah">Rendah</option>
              <option value="normal">Normal</option>
              <option value="tinggi">Tinggi</option>
              <option value="urgent">Urgent</option>
            </Select>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}