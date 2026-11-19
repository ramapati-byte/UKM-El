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
  InventoryItem,
  InventoryQuery,
  InventoryCategory,
  InventoryCondition,
} from "@/types/inventory";
import type { BadgeVariant } from "@/types/common";

const conditionVariantMap: Record<InventoryCondition, BadgeVariant> = {
  baru: "success",
  baik: "info",
  rusak_ringan: "warning",
  rusak_berat: "danger",
  hilang: "secondary",
};

const conditionLabelMap: Record<InventoryCondition, string> = {
  baru: "Baru",
  baik: "Baik",
  rusak_ringan: "Rusak Ringan",
  rusak_berat: "Rusak Berat",
  hilang: "Hilang",
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    kode: string;
    nama: string;
    kategori: InventoryCategory;
    stok: number;
    lokasi: string;
    keterangan: string;
  }>({
    kode: "",
    nama: "",
    kategori: "barang",
    stok: 1,
    lokasi: "",
    keterangan: "",
  });
  const [query, setQuery] = useState<InventoryQuery>({
    page: 1,
    limit: 10,
    search: "",
    kategori: "all",
    kondisi: "all",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryService.list(query);
      setItems(res.data);
      setTotal(res.total);
      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat data inventaris";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryService.create({
        kode: form.kode,
        nama: form.nama,
        kategori: form.kategori,
        stok: Number(form.stok),
        lokasi: form.lokasi || undefined,
        keterangan: form.keterangan || undefined,
      });
      setOpen(false);
      setForm({
        kode: "",
        nama: "",
        kategori: "barang",
        stok: 1,
        lokasi: "",
        keterangan: "",
      });
      load();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menambahkan item";
      alert(message);
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus barang/ruang "${nama}"?`)) return;
    try {
      await inventoryService.delete(id);
      load();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menghapus item";
      alert(message);
    }
  };

  const totalPages = Math.ceil(total / (query.limit || 10)) || 1;

  return (
    <AppShell title="Inventaris" subtitle="Daftar barang dan ruang UKM">
      <div className="space-y-6">
        <PageHeader
          title="Daftar Barang & Ruang"
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  (window.location.href = "/organizer/inventory/loans")
                }
              >
                <i className="bi bi-journal-bookmark mr-1.5" aria-hidden="true" />
                Daftar Peminjaman
              </Button>
              <Button onClick={() => setOpen(true)}>
                <i className="bi bi-plus-circle mr-1.5" aria-hidden="true" />
                Tambah Barang / Ruang
              </Button>
            </div>
          }
        />

        {/* Filter bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Pencarian
              </label>
              <Input
                placeholder="Cari nama atau kode..."
                value={query.search || ""}
                onChange={(e) =>
                  setQuery((q) => ({ ...q, search: e.target.value, page: 1 }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Kategori
              </label>
              <Select
                value={query.kategori || "all"}
                onChange={(v: string) =>
                  setQuery((q) => ({ ...q, kategori: v as InventoryCategory | "all", page: 1 }))
                }
              >
                <option value="all">Semua Kategori</option>
                <option value="barang">Barang</option>
                <option value="ruang">Ruang</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Kondisi
              </label>
              <Select
                value={query.kondisi || "all"}
                onChange={(v: string) =>
                  setQuery((q) => ({ ...q, kondisi: v as InventoryCondition | "all", page: 1 }))
                }
              >
                <option value="all">Semua Kondisi</option>
                <option value="baru">Baru</option>
                <option value="baik">Baik</option>
                <option value="rusak_ringan">Rusak Ringan</option>
                <option value="rusak_berat">Rusak Berat</option>
                <option value="hilang">Hilang</option>
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
                    kategori: "all",
                    kondisi: "all",
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
                  key: "kode",
                  label: "Kode",
                  render: (row) => (
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {row.kode}
                    </span>
                  ),
                },
                {
                  key: "nama",
                  label: "Nama",
                  render: (row) => (
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {row.nama}
                      </p>
                      {row.keterangan && (
                        <p className="text-xs text-slate-500 truncate max-w-xs">
                          {row.keterangan}
                        </p>
                      )}
                    </div>
                  ),
                },
                {
                  key: "kategori",
                  label: "Kategori",
                  render: (row) => (
                    <Badge variant={row.kategori === "barang" ? "primary" : "info"}>
                      {row.kategori === "barang" ? "Barang" : "Ruang"}
                    </Badge>
                  ),
                },
                {
                  key: "kondisi",
                  label: "Kondisi",
                  render: (row) => (
                    <Badge
                      variant={conditionVariantMap[row.kondisi] ?? "secondary"}
                      dot
                    >
                      {conditionLabelMap[row.kondisi] ?? row.kondisi}
                    </Badge>
                  ),
                },
                {
                  key: "stok",
                  label: "Stok",
                  align: "center",
                  render: (row) => (
                    <span className="font-semibold">{row.stok}</span>
                  ),
                },
                {
                  key: "lokasi",
                  label: "Lokasi",
                  render: (row) => row.lokasi || "-",
                },
              ]}
              data={items}
              rowActions={[
                {
                  label: "Hapus",
                  variant: "danger",
                  onClick: (row) => handleDelete(row.id, row.nama),
                },
              ]}
            />

            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  Total {total} barang/ruang
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

        {/* Modal Tambah Barang / Ruang */}
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Tambah Barang / Ruang Baru"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kode Barang/Ruang *
                </label>
                <Input
                  value={form.kode}
                  onChange={(e) => setForm({ ...form, kode: e.target.value })}
                  placeholder="Contoh: BRG-005 atau RNG-002"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori *
                </label>
                <Select
                  value={form.kategori}
                  onChange={(v: string) =>
                    setForm({ ...form, kategori: v as InventoryCategory })
                  }
                >
                  <option value="barang">Barang</option>
                  <option value="ruang">Ruang</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Barang / Ruang *
              </label>
              <Input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Contoh: Sound System Portable / Aula Kampus"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jumlah Stok *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={form.stok}
                  onChange={(e) =>
                    setForm({ ...form, stok: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lokasi Penyimpanan
                </label>
                <Input
                  value={form.lokasi}
                  onChange={(e) =>
                    setForm({ ...form, lokasi: e.target.value })
                  }
                  placeholder="Contoh: Gedung B Lt. 2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Keterangan
              </label>
              <Input
                value={form.keterangan}
                onChange={(e) =>
                  setForm({ ...form, keterangan: e.target.value })
                }
                placeholder="Spesifikasi atau informasi tambahan"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit">
                <i className="bi bi-save mr-1.5" aria-hidden="true" /> Simpan
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
