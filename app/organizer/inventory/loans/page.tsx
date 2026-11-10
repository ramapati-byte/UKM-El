"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import { inventoryService } from "@/services/inventory.service";
import type { InventoryLoan, LoanQuery } from "@/types/inventory";
import { formatDateShort } from "@/lib/format";

export default function InventoryLoansPage() {
  const [loans, setLoans] = useState<InventoryLoan[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<LoanQuery>({ page: 1, limit: 10 });

  useEffect(() => { load(); }, [query]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.listLoans(query);
      setLoans(res.data);
      setTotal(res.total);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data peminjaman");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, status: "disetujui" | "ditolak") => {
    try {
      await inventoryService.approveLoan(id, { status });
      load();
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui status");
    }
  };

  if (loading) return (<AppShell title="Peminjaman"><div className="flex items-center justify-center min-h-[400px]">Memuat data...</div></AppShell>);
  if (error) return (<AppShell title="Peminjaman"><div className="p-6 text-center"><p className="text-danger">{error}</p><Button onClick={load}>Coba Lagi</Button></div></AppShell>);

  return (
    <AppShell title="Peminjaman" subtitle="Pengajuan dan approval peminjaman barang/ruang">
      <PageHeader title="Daftar Peminjaman" />
      <DataTable
        columns={[
          { key: "nomorPinjam", label: "Nomor Pinjam" },
          { key: "itemNama", label: "Item" },
          { key: "jumlah", label: "Jumlah" },
          { key: "dipinjamOleh", label: "Peminjam" },
          { key: "status", label: "Status" },
          { key: "tanggalPinjam", label: "Tgl Pinjam" },
          { key: "tanggalKembaliRencana", label: "Tgl Kembali" },
        ]}
        data={loans.map((l) => ({
          id: l.id,
          nomorPinjam: l.nomorPinjam,
          itemNama: l.itemNama,
          jumlah: l.jumlah,
          dipinjamOleh: l.dipinjamOleh,
          status: l.status,
          tanggalPinjam: formatDateShort(l.tanggalPinjam),
          tanggalKembaliRencana: formatDateShort(l.tanggalKembaliRencana),
        }))}
        rowActions={[
          { label: "Setujui", onClick: (row: any) => handleApprove(row.id, "disetujui") },
          { label: "Tolak", onClick: (row: any) => handleApprove(row.id, "ditolak"), variant: "danger" },
        ]}
      />
    </AppShell>
  );
}