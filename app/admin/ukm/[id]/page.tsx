"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { ukmService } from "@/services/ukm.service";
import type { UkmEntity } from "@/types/ukm";
import { usePermission } from "@/hooks/usePermission";

export default function UkmDetailPage({ params }: { params: { id: string } }) {
  const { can } = usePermission("superadmin");
  const [ukm, setUkm] = useState<UkmEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [params.id]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await ukmService.detail(params.id);
      setUkm(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "UKM tidak ditemukan");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (status: "verified" | "rejected") => {
    if (!ukm) return;
    if (!confirm(`Yakin ingin ${status === "verified" ? "setujui" : "tolak"} UKM ini?`)) return;
    try {
      await ukmService.verify(ukm.id, { status });
      load();
    } catch (err: any) {
      setError(err.message || "Gagal memverifikasi UKM");
    }
  };

  if (loading) {
    return (
      <AppShell title="Detail UKM">
        <div className="flex items-center justify-center min-h-[400px]">Memuat data...</div>
      </AppShell>
    );
  }

  if (error || !ukm) {
    return (
      <AppShell title="Detail UKM">
        <div className="p-6 text-center">
          <p className="text-danger">{error || "Data tidak ditemukan"}</p>
          <Button onClick={() => window.history.back()}>Kembali</Button>
        </div>
      </AppShell>
    );
  }

  const statusColor: Record<string, string> = {
    verified: "bg-success text-white",
    pending: "bg-warning text-white",
    rejected: "bg-danger text-white",
    inactive: "bg-secondary text-white",
  };

  return (
    <AppShell title="Detail UKM" subtitle={ukm.nama}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8">
          <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
            <div className="flex items-center gap-4 mb-6">
              {ukm.logoUrl ? (
                <img src={ukm.logoUrl} alt={ukm.nama} className="w-16 h-16 rounded object-cover" />
              ) : (
                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                  <i className="bi bi-building text-slate-500 text-2xl"></i>
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{ukm.nama}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">@{ukm.ukmSlug}</p>
              </div>
              <Badge variant={statusColor[ukm.status] || "primary"} className="ml-auto">
                {ukm.status}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 py-3">
                <span className="text-slate-500">Kategori</span>
                <span className="font-medium">{ukm.kategori}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 py-3">
                <span className="text-slate-500">Status</span>
                <span className={`font-medium ${statusColor[ukm.status]}`}>{ukm.status}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 py-3">
                <span className="text-slate-500">Kontak Person</span>
                <span className="font-medium">{ukm.kontakPerson || "-"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 py-3">
                <span className="text-slate-500">Email</span>
                <span className="font-medium">{ukm.email || "-"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 py-3">
                <span className="text-slate-500">Telepon</span>
                <span className="font-medium">{ukm.noHp || "-"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 py-3">
                <span className="text-slate-500">Alamat</span>
                <span className="font-medium">{ukm.alamat || "-"}</span>
              </div>
              {ukm.visi && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Visi</h4>
                  <p className="text-slate-600 dark:text-slate-400">{ukm.visi}</p>
                </div>
              )}
              {ukm.misi && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Misi</h4>
                  <p className="text-slate-600 dark:text-slate-400">{ukm.misi}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="md:col-span-4">
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Aksi</h3>
              {ukm.status === "pending" && can("ukm.verify") && (
                <div className="space-y-2">
                  <Button onClick={() => handleVerify("verified")} className="w-full">Setujui Verifikasi</Button>
                  <Button onClick={() => handleVerify("rejected")} variant="danger" className="w-full">Tolak Verifikasi</Button>
                </div>
              )}
              {ukm.status !== "pending" && can("ukm.edit") && (
                <Button variant="outline" className="w-full">Edit UKM</Button>
              )}
              <Button variant="outline" onClick={() => window.history.back()} className="w-full">Kembali ke Daftar</Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}