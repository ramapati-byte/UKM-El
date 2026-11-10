"use client";

import { useEffect, useState } from "react";
import PublicShell from "@/components/shell/PublicShell";
import PageHeader from "@/components/ui/PageHeader";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ukmService } from "@/services/ukm.service";
import type { UkmEntity } from "@/types/ukm";

export default function UkmsPage() {
  const [ukms, setUkms] = useState<UkmEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("all");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await ukmService.list({ search, kategori: kategori as any, status: "verified" });
      setUkms(res.data);
    } catch {
      setUkms([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = ukms.filter((u) => {
    const matchSearch = search === "" || u.nama.toLowerCase().includes(search.toLowerCase());
    const matchKategori = kategori === "all" || u.kategori === kategori;
    return matchSearch && matchKategori;
  });

  return (
    <PublicShell>
      <PageHeader title="Direktori UKM" subtitle="Jelajahi Unit Kegiatan Mahasiswa" />
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input placeholder="Cari UKM..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <Select value={kategori} onChange={(v) => setKategori(v)}>
          <option value="all">Semua Kategori</option>
          <option value="bem">BEM</option>
          <option value="himas">HIMAs</option>
          <option value="unit">Unit</option>
          <option value="km">KM</option>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12">Memuat data UKM...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500">Tidak ada UKM ditemukan</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ukm) => (
            <Card key={ukm.id} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                {ukm.logoUrl ? (
                  <img src={ukm.logoUrl} alt={ukm.nama} className="w-12 h-12 rounded object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                    <i className="bi bi-building text-slate-500"></i>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{ukm.nama}</h3>
                  <p className="text-xs text-slate-500">{ukm.kategori}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{ukm.visi || "Visi belum diisi"}</p>
              <Button variant="outline" size="sm" onClick={() => window.location.href = `/ukm/${ukm.ukmSlug}`}>
                Lihat Profil
              </Button>
            </Card>
          ))}
        </div>
      )}
    </PublicShell>
  );
}