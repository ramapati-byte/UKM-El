"use client";

import { useCallback, useEffect, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import { financeService } from "@/services/finance.service";
import type {
  FinanceTransaction,
  FinanceQuery,
  FinanceStatus,
  FinanceType,
  FinanceCategory,
} from "@/types/finance";
import type { BadgeVariant } from "@/types/common";
import { formatRupiah, formatDateShort } from "@/lib/format";

// ─── Status → Badge variant mapping ──────────────────────
const STATUS_VARIANT: Record<FinanceStatus, BadgeVariant> = {
  diajukan: "info",
  disetujui: "success",
  ditolak: "danger",
  dicairkan: "primary",
  dibatalkan: "secondary",
};

const STATUS_LABEL: Record<FinanceStatus, string> = {
  diajukan: "Diajukan",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
  dicairkan: "Dicairkan",
  dibatalkan: "Dibatalkan",
};

// ─── Jenis → Badge variant mapping ───────────────────────
const JENIS_VARIANT: Record<FinanceType, BadgeVariant> = {
  pemasukan: "success",
  pengeluaran: "danger",
};

const JENIS_LABEL: Record<FinanceType, string> = {
  pemasukan: "Pemasukan",
  pengeluaran: "Pengeluaran",
};

// ─── Row type for DataTable ──────────────────────────────
interface TransactionRow {
  id: string;
  nomorTransaksi: string;
  jenis: FinanceType;
  kategori: string;
  nominal: number;
  status: FinanceStatus;
  tanggalTransaksi: string;
}

// ─── Helper: trigger blob download ───────────────────────
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function FinancePage() {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    jenis: "pemasukan",
    kategori: "operasional",
    nominal: "",
    deskripsi: "",
    tanggalTransaksi: "",
    kegiatanId: "",
  });
  const [query, setQuery] = useState<FinanceQuery>({ page: 1, limit: 10 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await financeService.list(query);
      setTransactions(res.data);
      setTotal(res.total);
      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat data keuangan";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  // ─── Handlers ────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await financeService.create({
        jenis: form.jenis as FinanceType,
        kategori: form.kategori as FinanceCategory,
        nominal: Number(form.nominal),
        deskripsi: form.deskripsi,
        tanggalTransaksi: form.tanggalTransaksi,
        kegiatanId: form.kegiatanId || undefined,
      });
      setOpen(false);
      setForm({
        jenis: "pemasukan",
        kategori: "operasional",
        nominal: "",
        deskripsi: "",
        tanggalTransaksi: "",
        kegiatanId: "",
      });
      load();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal membuat transaksi";
      setError(message);
    }
  };

  const handleApprove = async (
    id: string,
    status: "disetujui" | "ditolak"
  ) => {
    try {
      await financeService.updateStatus(id, {
        status,
        catatan: status === "disetujui" ? "Disetujui" : "Ditolak",
      });
      load();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memperbarui status";
      setError(message);
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const blob = await financeService.exportPdf();
      downloadBlob(blob, "laporan-keuangan.pdf");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mengekspor PDF";
      setError(message);
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const blob = await financeService.exportExcel();
      downloadBlob(blob, "laporan-keuangan.xlsx");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mengekspor Excel";
      setError(message);
    } finally {
      setExporting(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleFilterChange = (
    key: "jenis" | "status" | "kategori",
    value: string
  ) => {
    setQuery((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  // ─── Loading state ──────────────────────────────────────
  if (loading && transactions.length === 0) {
    return (
      <AppShell title="Keuangan UKM">
        <div className="flex items-center justify-center min-h-[400px]">
          Memuat data...
        </div>
      </AppShell>
    );
  }

  // ─── Error state (no data loaded yet) ───────────────────
  if (error && transactions.length === 0) {
    return (
      <AppShell title="Keuangan UKM">
        <div className="p-6 text-center">
          <p className="text-danger">{error}</p>
          <Button onClick={load}>Coba Lagi</Button>
        </div>
      </AppShell>
    );
  }

  // ─── Computed values ────────────────────────────────────
  const totalPemasukan = transactions
    .filter((t) => t.jenis === "pemasukan")
    .reduce((s, t) => s + t.nominal, 0);
  const totalPengeluaran = transactions
    .filter((t) => t.jenis === "pengeluaran")
    .reduce((s, t) => s + t.nominal, 0);
  const saldo = totalPemasukan - totalPengeluaran;
  const totalPages = Math.max(1, Math.ceil(total / (query.limit ?? 10)));

  // ─── Table columns with render functions ────────────────
  const columns: Column<TransactionRow>[] = [
    { key: "nomorTransaksi", label: "Nomor Transaksi" },
    {
      key: "jenis",
      label: "Jenis",
      render: (row) => (
        <Badge variant={JENIS_VARIANT[row.jenis]} size="sm" dot>
          {JENIS_LABEL[row.jenis]}
        </Badge>
      ),
    },
    { key: "kategori", label: "Kategori" },
    {
      key: "nominal",
      label: "Nominal",
      align: "right",
      render: (row) => formatRupiah(row.nominal),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status]} size="sm">
          {STATUS_LABEL[row.status]}
        </Badge>
      ),
    },
    {
      key: "tanggalTransaksi",
      label: "Tanggal",
      render: (row) => formatDateShort(row.tanggalTransaksi),
    },
  ];

  // ─── Map transactions to row data ──────────────────────
  const tableData: TransactionRow[] = transactions.map((t) => ({
    id: t.id,
    nomorTransaksi: t.nomorTransaksi,
    jenis: t.jenis,
    kategori: t.kategori,
    nominal: t.nominal,
    status: t.status,
    tanggalTransaksi: t.tanggalTransaksi,
  }));

  return (
    <AppShell title="Keuangan UKM" subtitle="Ledger keuangan per UKM">
      <PageHeader
        title="Ledger Keuangan"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={handleExportPdf} disabled={exporting}>
              <i className="bi bi-file-earmark-pdf" aria-hidden="true" />{" "}
              Ekspor PDF
            </Button>
            <Button onClick={handleExportExcel} disabled={exporting}>
              <i className="bi bi-file-earmark-excel" aria-hidden="true" />{" "}
              Ekspor Excel
            </Button>
            <Button onClick={() => setOpen(true)}>
              <i className="bi bi-plus-lg" aria-hidden="true" /> Tambah
              Transaksi
            </Button>
          </div>
        }
      />

      {/* ─── Summary Cards ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
          <p className="text-xs text-slate-500">Total Pemasukan</p>
          <p className="text-xl font-bold text-success">
            {formatRupiah(totalPemasukan)}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
          <p className="text-xs text-slate-500">Total Pengeluaran</p>
          <p className="text-xl font-bold text-danger">
            {formatRupiah(totalPengeluaran)}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
          <p className="text-xs text-slate-500">Saldo</p>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {formatRupiah(saldo)}
          </p>
        </div>
      </div>

      {/* ─── Search & Filter Bar ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="relative">
          <i
            className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <Input
            type="text"
            placeholder="Cari nomor / deskripsi..."
            value={query.search ?? ""}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        <Select
          value={query.jenis ?? "all"}
          onChange={(v: string) => handleFilterChange("jenis", v)}
        >
          <option value="all">Semua Jenis</option>
          <option value="pemasukan">Pemasukan</option>
          <option value="pengeluaran">Pengeluaran</option>
        </Select>
        <Select
          value={query.status ?? "all"}
          onChange={(v: string) => handleFilterChange("status", v)}
        >
          <option value="all">Semua Status</option>
          <option value="diajukan">Diajukan</option>
          <option value="disetujui">Disetujui</option>
          <option value="ditolak">Ditolak</option>
          <option value="dicairkan">Dicairkan</option>
          <option value="dibatalkan">Dibatalkan</option>
        </Select>
        <Select
          value={query.kategori ?? "all"}
          onChange={(v: string) => handleFilterChange("kategori", v)}
        >
          <option value="all">Semua Kategori</option>
          <option value="operasional">Operasional</option>
          <option value="kegiatan">Kegiatan</option>
          <option value="kepentingan">Kepentingan</option>
          <option value="lainnya">Lainnya</option>
        </Select>
      </div>

      {/* ─── Inline error banner ────────────────────────── */}
      {error && (
        <div className="mb-4 p-3 rounded border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
            aria-label="Tutup pesan error"
          >
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* ─── Data Table ─────────────────────────────────── */}
      <DataTable<TransactionRow>
        columns={columns}
        data={tableData}
        loading={loading}
        rowActions={[
          {
            label: "Setujui",
            onClick: (row: TransactionRow) =>
              handleApprove(row.id, "disetujui"),
          },
          {
            label: "Tolak",
            onClick: (row: TransactionRow) => handleApprove(row.id, "ditolak"),
            variant: "danger",
          },
        ]}
      />

      {/* ─── Pagination ─────────────────────────────────── */}
      <Pagination
        currentPage={query.page ?? 1}
        totalPages={totalPages}
        totalRecords={total}
        onPageChange={handlePageChange}
      />

      {/* ─── Create Transaction Modal ───────────────────── */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Tambah Transaksi"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Jenis
            </label>
            <Select
              value={form.jenis}
              onChange={(v: string) => setForm({ ...form, jenis: v })}
            >
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Kategori
            </label>
            <Select
              value={form.kategori}
              onChange={(v: string) => setForm({ ...form, kategori: v })}
            >
              <option value="operasional">Operasional</option>
              <option value="kegiatan">Kegiatan</option>
              <option value="kepentingan">Kepentingan</option>
              <option value="lainnya">Lainnya</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nominal (Rp)
            </label>
            <Input
              type="number"
              value={form.nominal}
              onChange={(e) => setForm({ ...form, nominal: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi
            </label>
            <Input
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tanggal
            </label>
            <Input
              type="date"
              value={form.tanggalTransaksi}
              onChange={(e) =>
                setForm({ ...form, tanggalTransaksi: e.target.value })
              }
              required
            />
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
