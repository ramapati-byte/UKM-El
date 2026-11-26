"use client";

import { useEffect, useState, useCallback, use } from "react";
import AppShell from "@/components/shell/AppShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { ukmService } from "@/services/ukm.service";
import type { UkmEntity, UkmCategory } from "@/types/ukm";
import type { BadgeVariant } from "@/types/common";
import { usePermission } from "@/hooks/usePermission";

export default function UkmDetailPage({ params: paramsProp }: { params: Promise<{ id: string }> }) {
  const params = use(paramsProp);
  const { can } = usePermission("superadmin");
  const [ukm, setUkm] = useState<UkmEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<{
    nama: string;
    singkatan: string;
    kategori: UkmCategory;
    email: string;
    visi: string;
    instagram: string;
  }>({
    nama: "",
    singkatan: "",
    kategori: "unit",
    email: "",
    visi: "",
    instagram: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ukmService.detail(params.id);
      setUkm(data);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "UKM tidak ditemukan";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleVerify = async (status: "verified" | "rejected") => {
    if (!ukm) return;
    if (!confirm(`Yakin ingin ${status === "verified" ? "setujui" : "tolak"} UKM ini?`)) return;
    try {
      await ukmService.verify(ukm.id, { status });
      load();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memverifikasi UKM";
      setError(message);
    }
  };

  const handleOpenEdit = () => {
    if (!ukm) return;
    setEditForm({
      nama: ukm.nama || "",
      singkatan: ukm.singkatan || "",
      kategori: ukm.kategori || "unit",
      email: ukm.email || "",
      visi: ukm.visi || "",
      instagram: ukm.mediaSosial?.instagram || "",
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ukm) return;
    setSaving(true);
    try {
      await ukmService.update(ukm.id, {
        nama: editForm.nama,
        singkatan: editForm.singkatan || undefined,
        kategori: editForm.kategori,
        email: editForm.email || undefined,
        visi: editForm.visi || undefined,
        mediaSosial: editForm.instagram ? { instagram: editForm.instagram } : undefined,
      });
      setEditOpen(false);
      await load();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memperbarui data UKM";
      setError(message);
    } finally {
      setSaving(false);
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

  const statusVariant: Record<string, BadgeVariant> = {
    verified: "success",
    pending: "warning",
    rejected: "danger",
    inactive: "secondary",
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
              <Badge variant={statusVariant[ukm.status] ?? "secondary"}>
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
                <Badge variant={statusVariant[ukm.status] ?? "secondary"}>{ukm.status}</Badge>
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
                <Button variant="outline" onClick={handleOpenEdit} className="w-full mb-2">Edit UKM</Button>
              )}
              <Button variant="outline" onClick={() => window.history.back()} className="w-full">Kembali ke Daftar</Button>
            </div>
          </div>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Data UKM">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Nama UKM"
            required
            value={editForm.nama}
            onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Singkatan"
              value={editForm.singkatan}
              onChange={(e) => setEditForm({ ...editForm, singkatan: e.target.value })}
              placeholder="Contoh: BEM / HIMATIF"
            />
            <Select
              label="Kategori"
              value={editForm.kategori}
              onChange={(val: string) => setEditForm({ ...editForm, kategori: val as UkmCategory })}
              options={[
                { value: "bem", label: "BEM" },
                { value: "himas", label: "HIMA" },
                { value: "unit", label: "Unit Kegiatan" },
                { value: "km", label: "Kegiatan Mahasiswa" },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Resmi"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
            <Input
              label="Instagram"
              value={editForm.instagram}
              onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
              placeholder="@ukm_elrahma"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Visi / Deskripsi
            </label>
            <textarea
              rows={3}
              value={editForm.visi}
              onChange={(e) => setEditForm({ ...editForm, visi: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}