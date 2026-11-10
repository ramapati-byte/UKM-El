"use client";

import { useEffect, useState, use } from "react";
import PublicShell from "@/components/shell/PublicShell";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ukmService } from "@/services/ukm.service";
import type { UkmEntity } from "@/types/ukm";

export default function UkmDetailPublicPage({ params: paramsProp }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const params = "then" in paramsProp ? use(paramsProp as Promise<{ slug: string }>) : paramsProp as { slug: string };
  const [ukm, setUkm] = useState<UkmEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [params.slug]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await ukmService.getBySlug(params.slug);
      setUkm(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "UKM tidak ditemukan");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PublicShell>
        <div className="flex items-center justify-center min-h-[400px]">Memuat data...</div>
      </PublicShell>
    );
  }

  if (error || !ukm) {
    return (
      <PublicShell>
        <div className="p-6 text-center">
          <p className="text-danger">{error || "Data tidak ditemukan"}</p>
          <Button onClick={() => window.history.back()}>Kembali</Button>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <PageHeader title={ukm.nama} subtitle={`@${ukm.ukmSlug}`} />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              {ukm.logoUrl ? (
                <img src={ukm.logoUrl} alt={ukm.nama} className="w-20 h-20 rounded object-cover" />
              ) : (
                <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                  <i className="bi bi-building text-slate-500 text-3xl"></i>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{ukm.nama}</h1>
                <p className="text-slate-500">{ukm.kategori}</p>
              </div>
            </div>
            {ukm.visi && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Visi</h4>
                <p className="text-slate-600 dark:text-slate-400">{ukm.visi}</p>
              </div>
            )}
            {ukm.misi && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Misi</h4>
                <p className="text-slate-600 dark:text-slate-400">{ukm.misi}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded">
                <p className="text-xs text-slate-500">Kontak Person</p>
                <p className="text-sm font-medium">{ukm.kontakPerson || "-"}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded">
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm font-medium">{ukm.email || "-"}</p>
              </div>
            </div>
          </Card>
        </div>
        <div className="md:col-span-4">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Bergabung</h3>
            <Button className="w-full">Daftar Sekarang</Button>
          </Card>
        </div>
      </div>
    </PublicShell>
  );
}