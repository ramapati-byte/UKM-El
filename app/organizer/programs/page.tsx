"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { programService } from "@/services/program.service";
import type { ProgramEntity, ProgramQuery } from "@/types/program";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramEntity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nama: "", deskripsi: "", periode: "2026/2027", target: "", satuan: "peserta", divisi: "", tanggalMulai: "", tanggalSelesai: "" });
  const [query, setQuery] = useState<ProgramQuery>({ page: 1, limit: 10 });

  useEffect(() => { load(); }, [query]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await programService.list(query);
      setPrograms(res.data);
      setTotal(res.total);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data program");
    } finally {
      setLoading(false);
    }
  };

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
        status: "draft",
        ukmId: "ukm-bem",
        divisi: form.divisi,
        tanggalMulai: form.tanggalMulai,
        tanggalSelesai: form.tanggalSelesai,
        createdBy: "user-001",
      });
      setOpen(false);
      setForm({ nama: "", deskripsi: "", periode: "2026/2027", target: "", satuan: "peserta", divisi: "", tanggalMulai: "", tanggalSelesai: "" });
      load();
    } catch (err: any) {
      setError(err.message || "Gagal membuat program");
    }
  };

  const handleProgress = async (id: string, progres: number) => {
    try {
      await programService.updateProgress(id, progres, "Update progres");
      load();
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui progres");
    }
  };

  if (loading) return (<AppShell title="Program Kerja"><div className="flex items-center justify-center min-h-[400px]">Memuat data...</div></AppShell>);
  if (error) return (<AppShell title="Program Kerja"><div className="p-6 text-center"><p className="text-danger">{error}</p><Button onClick={load}>Coba Lagi</Button></div></AppShell>);

  return (
    <AppShell title="Program Kerja" subtitle="Proker per periode UKM">
      <PageHeader title="Daftar Program Kerja" actions={<Button onClick={() => setOpen(true)}>+ Tambah Proker</Button>} />
      <DataTable
        columns={[
          { key: "nama", label: "Nama Program" },
          { key: "periode", label: "Periode" },
          { key: "target", label: "Target" },
          { key: "realisasi", label: "Realisasi" },
          { key: "status", label: "Status" },
          { key: "divisi", label: "Divisi" },
        ]}
        data={programs.map((p) => ({
          id: p.id,
          nama: p.nama,
          periode: p.periode,
          target: p.target,
          realisasi: p.realisasi,
          status: p.status,
          divisi: p.divisi || "-",
        }))}
        rowActions={[
          {
            label: (row: any) => `Update (${row.realisasi}/${row.target})`,
            onClick: (row: any) => {
              const val = prompt("Masukkan progres baru:", String(row.realisasi));
              if (val !== null) handleProgress(row.id, Number(val));
            },
          },
        ]}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Tambah Program Kerja">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Program</label>
            <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi</label>
            <Input value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Periode</label>
            <Input value={form.periode} onChange={(e) => setForm({ ...form, periode: e.target.value })} placeholder="2026/2027" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target</label>
            <Input type="number" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Satuan</label>
            <Input value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })} placeholder="peserta" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Divisi</label>
            <Input value={form.divisi} onChange={(e) => setForm({ ...form, divisi: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Mulai</label>
            <Input type="date" value={form.tanggalMulai} onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Selesai</label>
            <Input type="date" value={form.tanggalSelesai} onChange={(e) => setForm({ ...form, tanggalSelesai: e.target.value })} required />
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}