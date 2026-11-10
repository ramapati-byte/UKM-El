"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { financeService } from "@/services/finance.service";
import type { FinanceTransaction, FinanceQuery } from "@/types/finance";
import { formatRupiah } from "@/lib/format";

export default function FinancePage() {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ jenis: "pemasukan", kategori: "operasional", nominal: "", deskripsi: "", tanggalTransaksi: "", kegiatanId: "" });
  const [query, setQuery] = useState<FinanceQuery>({ page: 1, limit: 10 });

  useEffect(() => { load(); }, [query]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await financeService.list(query);
      setTransactions(res.data);
      setTotal(res.total);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data keuangan");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await financeService.create({
        jenis: form.jenis as any,
        kategori: form.kategori as any,
        nominal: Number(form.nominal),
        deskripsi: form.deskripsi,
        tanggalTransaksi: form.tanggalTransaksi,
        kegiatanId: form.kegiatanId || undefined,
      });
      setOpen(false);
      setForm({ jenis: "pemasukan", kategori: "operasional", nominal: "", deskripsi: "", tanggalTransaksi: "", kegiatanId: "" });
      load();
    } catch (err: any) {
      setError(err.message || "Gagal membuat transaksi");
    }
  };

  const handleApprove = async (id: string, status: "disetujui" | "ditolak") => {
    try {
      await financeService.updateStatus(id, { status, catatan: status === "disetujui" ? "Disetujui" : "Ditolak" });
      load();
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui status");
    }
  };

  if (loading) return (<AppShell title="Keuangan UKM"><div className="flex items-center justify-center min-h-[400px]">Memuat data...</div></AppShell>);
  if (error) return (<AppShell title="Keuangan UKM"><div className="p-6 text-center"><p className="text-danger">{error}</p><Button onClick={load}>Coba Lagi</Button></div></AppShell>);

  const totalPemasukan = transactions.filter(t => t.jenis === "pemasukan").reduce((s, t) => s + t.nominal, 0);
  const totalPengeluaran = transactions.filter(t => t.jenis === "pengeluaran").reduce((s, t) => s + t.nominal, 0);
  const saldo = totalPemasukan - totalPengeluaran;

  return (
    <AppShell title="Keuangan UKM" subtitle="Ledger keuangan per UKM">
      <PageHeader title="Ledger Keuangan" actions={<Button onClick={() => setOpen(true)}>+ Tambah Transaksi</Button>} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
          <p className="text-xs text-slate-500">Total Pemasukan</p>
          <p className="text-xl font-bold text-success">{formatRupiah(totalPemasukan)}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
          <p className="text-xs text-slate-500">Total Pengeluaran</p>
          <p className="text-xl font-bold text-danger">{formatRupiah(totalPengeluaran)}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
          <p className="text-xs text-slate-500">Saldo</p>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{formatRupiah(saldo)}</p>
        </div>
      </div>
      <DataTable
        columns={[
          { key: "nomorTransaksi", label: "Nomor Transaksi" },
          { key: "jenis", label: "Jenis" },
          { key: "kategori", label: "Kategori" },
          { key: "nominal", label: "Nominal" },
          { key: "status", label: "Status" },
          { key: "tanggalTransaksi", label: "Tanggal" },
        ]}
        data={transactions.map((t) => ({
          id: t.id,
          nomorTransaksi: t.nomorTransaksi,
          jenis: t.jenis === "pemasukan" ? "Pemasukan" : "Pengeluaran",
          kategori: t.kategori,
          nominal: formatRupiah(t.nominal),
          status: t.status,
          tanggalTransaksi: t.tanggalTransaksi,
        }))}
        rowActions={[
          { label: "Setujui", onClick: (row: any) => handleApprove(row.id, "disetujui") },
          { label: "Tolak", onClick: (row: any) => handleApprove(row.id, "ditolak"), variant: "danger" },
        ]}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Tambah Transaksi">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jenis</label>
            <Select value={form.jenis} onChange={(v) => setForm({ ...form, jenis: v })}>
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
            <Select value={form.kategori} onChange={(v) => setForm({ ...form, kategori: v })}>
              <option value="operasional">Operasional</option>
              <option value="kegiatan">Kegiatan</option>
              <option value="kepentingan">Kepentingan</option>
              <option value="lainnya">Lainnya</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nominal (Rp)</label>
            <Input type="number" value={form.nominal} onChange={(e) => setForm({ ...form, nominal: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi</label>
            <Input value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
            <Input type="date" value={form.tanggalTransaksi} onChange={(e) => setForm({ ...form, tanggalTransaksi: e.target.value })} required />
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}