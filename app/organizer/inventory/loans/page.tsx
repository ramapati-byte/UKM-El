"use client";

import { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/shell/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import { inventoryService } from "@/services/inventory.service";
import type {
  InventoryLoan,
  LoanQuery,
  LoanStatus,
  InventoryItem,
  InventoryCondition,
} from "@/types/inventory";
import type { BadgeVariant } from "@/types/common";
import { formatDateShort } from "@/lib/format";

const statusVariantMap: Record<LoanStatus, BadgeVariant> = {
  diajukan: "info",
  disetujui: "success",
  ditolak: "danger",
  dikembalikan: "secondary",
  terlambat: "danger",
};

const statusLabelMap: Record<LoanStatus, string> = {
  diajukan: "Diajukan",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
  dikembalikan: "Dikembalikan",
  terlambat: "Terlambat",
};

export default function InventoryLoansPage() {
  const [loans, setLoans] = useState<InventoryLoan[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<InventoryLoan | null>(null);
  const [returnCondition, setReturnCondition] =
    useState<InventoryCondition>("baik");
  const [returnNote, setReturnNote] = useState("");

  const [form, setForm] = useState({
    itemId: "",
    jumlah: 1,
    tanggalPinjam: new Date().toISOString().split("T")[0],
    tanggalKembaliRencana: "",
    catatanCheckout: "",
  });

  const [query, setQuery] = useState<LoanQuery>({
    page: 1,
    limit: 10,
    search: "",
    status: "all",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryService.listLoans(query);
      setLoans(res.data);
      setTotal(res.total);
      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat data peminjaman";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    inventoryService
      .list({ limit: 100 })
      .then((res) => setItems(res.data))
      .catch(() => {});
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemId) {
      alert("Pilih barang atau ruang yang ingin dipinjam.");
      return;
    }

    try {
      // Cek ketersediaan
      const available = await inventoryService.checkAvailability(
        form.itemId,
        form.tanggalPinjam,
        form.tanggalKembaliRencana
      );
      if (!available) {
        alert(
          "Peringatan: Jadwal peminjaman bentrok dengan peminjaman lain. Peminjaman tidak dapat diajukan."
        );
        return;
      }

      await inventoryService.createLoan({
        itemId: form.itemId,
        jumlah: Number(form.jumlah),
        tanggalPinjam: form.tanggalPinjam,
        tanggalKembaliRencana: form.tanggalKembaliRencana,
        catatanCheckout: form.catatanCheckout || undefined,
      });

      setOpenCreate(false);
      setForm({
        itemId: "",
        jumlah: 1,
        tanggalPinjam: new Date().toISOString().split("T")[0],
        tanggalKembaliRencana: "",
        catatanCheckout: "",
      });
      load();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal membuat pengajuan";
      alert(message);
    }
  };

  const handleApprove = async (id: string, status: "disetujui" | "ditolak") => {
    const text = status === "disetujui" ? "Setujui" : "Tolak";
    if (!confirm(`${text} peminjaman ini?`)) return;
    try {
      await inventoryService.approveLoan(id, { status });
      load();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memperbarui status";
      alert(message);
    }
  };

  const handleOpenReturn = (loan: InventoryLoan) => {
    setSelectedLoan(loan);
    setReturnCondition("baik");
    setReturnNote("");
    setOpenReturn(true);
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;
    try {
      await inventoryService.returnLoan(
        selectedLoan.id,
        returnCondition,
        returnNote || undefined
      );
      setOpenReturn(false);
      setSelectedLoan(null);
      load();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mencatat pengembalian";
      alert(message);
    }
  };

  const totalPages = Math.ceil(total / (query.limit || 10)) || 1;

  return (
    <AppShell
      title="Peminjaman"
      subtitle="Pengajuan dan approval peminjaman barang/ruang"
      breadcrumbs={[
        { label: "Dashboard", href: "/organizer/dashboard" },
        { label: "Inventaris", href: "/organizer/inventory" },
        { label: "Peminjaman" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Daftar Peminjaman"
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  (window.location.href = "/organizer/inventory")
                }
              >
                <i className="bi bi-box-seam mr-1.5" aria-hidden="true" />
                Daftar Inventaris
              </Button>
              <Button onClick={() => setOpenCreate(true)}>
                <i className="bi bi-plus-circle mr-1.5" aria-hidden="true" />
                Ajukan Peminjaman
              </Button>
            </div>
          }
        />

        {/* Filter bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Pencarian
              </label>
              <Input
                placeholder="Cari item atau peminjam..."
                value={query.search || ""}
                onChange={(e) =>
                  setQuery((q) => ({ ...q, search: e.target.value, page: 1 }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Status
              </label>
              <Select
                value={query.status || "all"}
                onChange={(v: string) =>
                  setQuery((q) => ({ ...q, status: v as LoanStatus | "all", page: 1 }))
                }
              >
                <option value="all">Semua Status</option>
                <option value="diajukan">Diajukan</option>
                <option value="disetujui">Disetujui</option>
                <option value="ditolak">Ditolak</option>
                <option value="dikembalikan">Dikembalikan</option>
                <option value="terlambat">Terlambat</option>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  setQuery({
                    page: 1,
                    limit: 10,
                    search: "",
                    status: "all",
                  })
                }
              >
                <i className="bi bi-arrow-counterclockwise mr-1.5" aria-hidden="true" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-danger mb-4">{error}</p>
            <Button onClick={load}>Coba Lagi</Button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <DataTable
              loading={loading}
              columns={[
                {
                  key: "nomorPinjam",
                  label: "Nomor Pinjam",
                  render: (row) => (
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {row.nomorPinjam}
                    </span>
                  ),
                },
                {
                  key: "itemNama",
                  label: "Item",
                  render: (row) => (
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {row.itemNama}
                      </p>
                      <p className="text-xs text-slate-500">
                        Jumlah: {row.jumlah} unit
                      </p>
                    </div>
                  ),
                },
                {
                  key: "dipinjamOleh",
                  label: "Peminjam",
                  render: (row) => row.dipinjamOleh,
                },
                {
                  key: "status",
                  label: "Status",
                  render: (row) => (
                    <Badge
                      variant={statusVariantMap[row.status] ?? "secondary"}
                      dot
                    >
                      {statusLabelMap[row.status] ?? row.status}
                    </Badge>
                  ),
                },
                {
                  key: "tanggalPinjam",
                  label: "Tgl Pinjam",
                  render: (row) => formatDateShort(row.tanggalPinjam),
                },
                {
                  key: "tanggalKembaliRencana",
                  label: "Tgl Rencana Kembali",
                  render: (row) => formatDateShort(row.tanggalKembaliRencana),
                },
              ]}
              data={loans}
              rowActions={[
                {
                  label: (row) => (row.status === "diajukan" ? "Setujui" : ""),
                  variant: "success",
                  onClick: (row) => handleApprove(row.id, "disetujui"),
                },
                {
                  label: (row) => (row.status === "diajukan" ? "Tolak" : ""),
                  variant: "danger",
                  onClick: (row) => handleApprove(row.id, "ditolak"),
                },
                {
                  label: (row) =>
                    row.status === "disetujui" ? "Kembalikan" : "",
                  onClick: (row) => handleOpenReturn(row),
                },
              ]}
            />

            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  Total {total} peminjaman
                </span>
                <Pagination
                  currentPage={query.page || 1}
                  totalPages={totalPages}
                  onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
                />
              </div>
            )}
          </div>
        )}

        {/* Modal Ajukan Peminjaman */}
        <Modal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          title="Ajukan Peminjaman Barang / Ruang"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pilih Barang atau Ruang *
              </label>
              <Select
                value={form.itemId}
                onChange={(v: string) => setForm({ ...form, itemId: v })}
              >
                <option value="">-- Pilih Barang / Ruang --</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    [{i.kategori.toUpperCase()}] {i.nama} (Stok: {i.stok})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jumlah *
              </label>
              <Input
                type="number"
                min="1"
                value={form.jumlah}
                onChange={(e) =>
                  setForm({ ...form, jumlah: Number(e.target.value) })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Pinjam *
                </label>
                <Input
                  type="date"
                  value={form.tanggalPinjam}
                  onChange={(e) =>
                    setForm({ ...form, tanggalPinjam: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rencana Kembali *
                </label>
                <Input
                  type="date"
                  value={form.tanggalKembaliRencana}
                  onChange={(e) =>
                    setForm({ ...form, tanggalKembaliRencana: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan / Keperluan
              </label>
              <Input
                value={form.catatanCheckout}
                onChange={(e) =>
                  setForm({ ...form, catatanCheckout: e.target.value })
                }
                placeholder="Contoh: Digunakan untuk Workshop Koding BEM"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenCreate(false)}
              >
                Batal
              </Button>
              <Button type="submit">
                <i className="bi bi-send mr-1.5" aria-hidden="true" /> Ajukan
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal Catat Pengembalian */}
        <Modal
          open={openReturn}
          onClose={() => setOpenReturn(false)}
          title={`Catat Pengembalian: ${selectedLoan?.itemNama ?? ""}`}
        >
          <form onSubmit={handleReturnSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kondisi Barang Saat Dikembalikan *
              </label>
              <Select
                value={returnCondition}
                onChange={(v: string) =>
                  setReturnCondition(v as InventoryCondition)
                }
              >
                <option value="baik">Baik (Tanpa Kerusakan)</option>
                <option value="rusak_ringan">Rusak Ringan</option>
                <option value="rusak_berat">Rusak Berat</option>
                <option value="hilang">Hilang</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan Pengembalian
              </label>
              <Input
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
                placeholder="Catatan kondisi atau kelengkapan barang saat dicek"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenReturn(false)}
              >
                Batal
              </Button>
              <Button type="submit" variant="success">
                <i className="bi bi-check2-circle mr-1.5" aria-hidden="true" />
                Konfirmasi Kembali
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
