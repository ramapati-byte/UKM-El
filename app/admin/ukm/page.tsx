"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import { ukmService } from "@/services/ukm.service";
import type { UkmEntity, UkmQuery } from "@/types/ukm";
import { usePermission } from "@/hooks/usePermission";
import { useOrg } from "@/hooks/useOrg";

const statusBadge: Record<string, string> = {
  verified: "success",
  pending: "warning",
  rejected: "danger",
  inactive: "secondary",
};

export default function UkmListPage() {
  const { can } = usePermission("superadmin");
  const { ukmId } = useOrg();
  const [ukms, setUkms] = useState<UkmEntity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ nama: string; ukmSlug: string; kategori: string }>({
    nama: "",
    ukmSlug: "",
    kategori: "bem",
  });
  const [query, setQuery] = useState<UkmQuery>({ page: 1, limit: 10 });

  useEffect(() => {
    load();
  }, [query]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await ukmService.list(query);
      setUkms(res.data);
      setTotal(res.total);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data UKM");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ukmService.create({
        nama: form.nama,
        ukmSlug: form.ukmSlug,
        kategori: form.kategori as any,
      });
      setOpen(false);
      setForm({ nama: "", ukmSlug: "", kategori: "bem" });
      load();
    } catch (err: any) {
      setError(err.message || "Gagal membuat UKM");
    }
  };

  const handleVerify = async (id: string, status: "verified" | "rejected") => {
    if (!confirm(`Yakin ingin ${status === "verified" ? "setujui" : "tolak"} UKM ini?`)) return;
    try {
      await ukmService.verify(id, { status });
      load();
    } catch (err: any) {
      setError(err.message || "Gagal memverifikasi UKM");
    }
  };

  return (
    <AppShell title="Manajemen UKM" subtitle="Kelola data UKM terverifikasi">
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">Memuat data...</div>
      ) : error ? (
        <div className="p-6 text-center">
          <p className="text-danger">{error}</p>
          <Button onClick={load}>Coba Lagi</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8">
            <PageHeader title="Daftar UKM" actions={
              <Button onClick={() => setOpen(true)}>+ Tambah UKM</Button>
            } />
            <DataTable
              columns={[
                { key: "nama", label: "Nama UKM" },
                { key: "ukmSlug", label: "Slug" },
                { key: "kategori", label: "Kategori" },
                { key: "status", label: "Status" },
              ]}
              data={ukms.map((u) => ({
                id: u.id,
                nama: u.nama,
                ukmSlug: u.ukmSlug,
                kategori: u.kategori,
                status: u.status,
              }))}
              rowActions={[
                {
                  label: (row: any) => row.status === "pending" ? "Setujui" : "Lihat",
                  onClick: (row: any) => {
                    if (row.status === "pending") handleVerify(row.id, "verified");
                  },
                },
                {
                  label: (row: any) => row.status === "pending" ? "Tolak" : "-",
                  onClick: (row: any) => {
                    if (row.status === "pending") handleVerify(row.id, "rejected");
                  },
                  variant: "danger",
                },
              ]}
            />
          </div>
          <div className="md:col-span-4">
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Statistik</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total:</span>
                    <span className="font-medium">{total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Terverifikasi:</span>
                    <span className="font-medium text-success">{ukms.filter(u => u.status === "verified").length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Pending:</span>
                    <span className="font-medium text-warning">{ukms.filter(u => u.status === "pending").length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Tambah UKM Baru">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama UKM</label>
            <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Slug URL</label>
            <Input value={form.ukmSlug} onChange={(e) => setForm({ ...form, ukmSlug: e.target.value })} placeholder="contoh: bem-elrahma" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
            <Select value={form.kategori} onChange={(v) => setForm({ ...form, kategori: v })}>
              <option value="bem">BEM</option>
              <option value="himas">HIMAs</option>
              <option value="unit">Unit</option>
              <option value="km">KM</option>
            </Select>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}