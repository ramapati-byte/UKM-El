"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { inventoryService } from "@/services/inventory.service";
import type { InventoryItem, InventoryQuery } from "@/types/inventory";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<InventoryQuery>({ page: 1, limit: 10 });

  useEffect(() => { load(); }, [query]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.list(query);
      setItems(res.data);
      setTotal(res.total);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data inventaris");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (<AppShell title="Inventaris"><div className="flex items-center justify-center min-h-[400px]">Memuat data...</div></AppShell>);
  if (error) return (<AppShell title="Inventaris"><div className="p-6 text-center"><p className="text-danger">{error}</p><Button onClick={load}>Coba Lagi</Button></div></AppShell>);

  return (
    <AppShell title="Inventaris" subtitle="Daftar barang dan ruang UKM">
      <PageHeader title="Daftar Barang & Ruang" actions={<Button onClick={() => window.location.href = "/organizer/inventory/loans"}>Peminjaman</Button>} />
      <DataTable
        columns={[
          { key: "kode", label: "Kode" },
          { key: "nama", label: "Nama" },
          { key: "kategori", label: "Kategori" },
          { key: "kondisi", label: "Kondisi" },
          { key: "stok", label: "Stok" },
          { key: "lokasi", label: "Lokasi" },
        ]}
        data={items.map((i) => ({
          id: i.id,
          kode: i.kode,
          nama: i.nama,
          kategori: i.kategori === "barang" ? "Barang" : "Ruang",
          kondisi: i.kondisi,
          stok: i.stok,
          lokasi: i.lokasi || "-",
        }))}
        rowActions={[]}
      />
    </AppShell>
  );
}