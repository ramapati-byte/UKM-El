"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { letterService } from "@/services/letter.service";
import type { LetterEntity } from "@/types/letter";
import { formatDateTime } from "@/lib/format";

export default function LetterDetailPage({ params }: { params: { id: string } }) {
  const [letter, setLetter] = useState<LetterEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { load(); }, [params.id]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await letterService.detail(params.id);
      setLetter(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Surat tidak ditemukan");
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (status: "diajujkan" | "disetujui" | "ditolak" | "diarcis") => {
    if (!letter) return;
    try {
      await letterService.updateStatus(letter.id, { status });
      load();
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui status");
    }
  };

  if (loading) return (<AppShell title="Detail Surat"><div className="flex items-center justify-center min-h-[400px]">Memuat data...</div></AppShell>);
  if (error || !letter) return (<AppShell title="Detail Surat"><div className="p-6 text-center"><p className="text-danger">{error}</p><Button onClick={() => window.history.back()}>Kembali</Button></div></AppShell>);

  return (
    <AppShell title="Detail Surat" subtitle={letter.nomorSurat}>
      <PageHeader title={letter.perihal} actions={
        <Button variant="outline" onClick={() => window.history.back()}>Kembali</Button>
      } />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8">
          <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Informasi Surat</h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 py-2">
                <span className="text-slate-500">Nomor Surat</span>
                <span className="font-medium">{letter.nomorSurat}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 py-2">
                <span className="text-slate-500">Jenis</span>
                <span className="font-medium">{letter.jenis === "surat_masuk" ? "Masuk" : "Keluar"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 py-2">
                <span className="text-slate-500">Status</span>
                <span className="font-medium">{letter.status}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 py-2">
                <span className="text-slate-500">Prioritas</span>
                <span className="font-medium">{letter.prioritas}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 py-2">
                <span className="text-slate-500">Perihal</span>
                <span className="font-medium">{letter.perihal}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 py-2">
                <span className="text-slate-500">Tujuan/Pengirim</span>
                <span className="font-medium">{letter.tujuan || letter.pengirim || "-"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 py-2">
                <span className="text-slate-500">Tanggal Surat</span>
                <span className="font-medium">{letter.tanggalSurat}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 py-2">
                <span className="text-slate-500">Dibuat Pada</span>
                <span className="font-medium">{formatDateTime(letter.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="md:col-span-4">
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Aksi</h3>
              <div className="space-y-2">
                {letter.status === "draft" && (
                  <Button onClick={() => handleStatus("diajujkan")} className="w-full">Ajukan Surat</Button>
                )}
                {letter.status === "diajujkan" && (
                  <>
                    <Button onClick={() => handleStatus("disetujui")} className="w-full">Setujui</Button>
                    <Button onClick={() => handleStatus("ditolak")} variant="danger" className="w-full">Tolak</Button>
                  </>
                )}
                {letter.status === "disetujui" && (
                  <Button onClick={() => handleStatus("diarcis")} variant="outline" className="w-full">Arsipkan</Button>
                )}
                <Button variant="outline" onClick={() => window.print()} className="w-full">Cetak / Preview</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}