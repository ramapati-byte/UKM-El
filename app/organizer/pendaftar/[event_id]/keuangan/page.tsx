"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "../../../../../lib/api";
import DashboardLayout from "../../../../../components/DashboardLayout";
import Swal from "sweetalert2";
import StatCard from "../../../../../components/ui/StatCard";
import Card, {
  CardBody,
  CardHeader,
  CardTitle,
  CardTools,
} from "../../../../../components/ui/Card";
import DataTable, { type Column } from "../../../../../components/ui/DataTable";
import Badge from "../../../../../components/ui/Badge";
import Select from "../../../../../components/ui/Select";
import Input from "../../../../../components/ui/Input";
import Pagination from "../../../../../components/ui/Pagination";
import LoadingSkeleton from "../../../../../components/ui/LoadingSkeleton";
import Callout from "../../../../../components/ui/Callout";

interface WorkshopDetails {
  id: number;
  judul: string;
  tipe_event: string;
  harga: number;
  nominal_denda: number;
}

interface FinancialStats {
  total_pendaftaran_lunas: number;
  total_pendaftaran_belum_lunas: number;
  total_denda_lunas: number;
  total_denda_belum_lunas: number;
  total_pemasukan_lunas: number;
  total_pemasukan_belum_lunas: number;
  grand_total: number;
}

interface FinancialRecord {
  id: string;
  nama_peserta: string;
  nim: string;
  email: string;
  tipe: "pendaftaran" | "denda";
  keterangan: string;
  nominal: number;
  status: "lunas" | "belum_lunas";
  tanggal: string;
}

export default function KeuanganEventPage() {
  const router = useRouter();
  const params = useParams();
  const { event_id } = params;

  const [user, setUser] = useState<{ id?: number; name: string; email: string; role: string } | null>(null);
  const [workshop, setWorkshop] = useState<WorkshopDetails | null>(null);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipe, setFilterTipe] = useState<"all" | "pendaftaran" | "denda">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "lunas" | "belum_lunas">("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      setUser(
        storedUser
          ? JSON.parse(storedUser)
          : { id: 2, name: "BEM El Rahma", email: "bem@elrahma.ac.id", role: "penyelenggara" }
      );
    }
  }, []);

  const fetchKeuangan = async () => {
    try {
      setLoading(true);
      let decoded_id = event_id as string;
      try {
        decoded_id = atob(decodeURIComponent(event_id as string));
      } catch (e) {}

      const res = await api.get(`/pendaftar/${decoded_id}/keuangan`);
      setWorkshop(res.data.workshop);
      setStats(res.data.stats);
      setRecords(res.data.records);
    } catch (err: unknown) {
      console.error(err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data keuangan",
        text: apiErr.response?.data?.message || "Terjadi kesalahan pada server.",
        confirmButtonColor: "#4f46e5",
      }).then(() => {
        router.push("/organizer/pendaftar");
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (event_id) {
      fetchKeuangan();
    }
  }, [event_id]);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.nama_peserta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.nim.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipe = filterTipe === "all" || rec.tipe === filterTipe;
    const matchesStatus = filterStatus === "all" || rec.status === filterStatus;

    return matchesSearch && matchesTipe && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<FinancialRecord>[] = [
    {
      key: "peserta",
      header: "Peserta",
      render: (rec) => (
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100">{rec.nama_peserta}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            NIM: {rec.nim} • {rec.email}
          </p>
        </div>
      ),
    },
    {
      key: "tipe",
      header: "Tipe Transaksi",
      render: (rec) => (
        <Badge variant={rec.tipe === "pendaftaran" ? "info" : "warning"} size="sm">
          {rec.tipe === "pendaftaran" ? "Registrasi" : "Denda"}
        </Badge>
      ),
    },
    {
      key: "keterangan",
      header: "Deskripsi",
      render: (rec) => (
        <span className="text-slate-600 dark:text-slate-300 font-medium">{rec.keterangan}</span>
      ),
    },
    {
      key: "nominal",
      header: "Nominal",
      render: (rec) => (
        <span className="font-bold text-slate-800 dark:text-slate-100">
          {formatRupiah(rec.nominal)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (rec) => (
        <Badge variant={rec.status === "lunas" ? "success" : "warning"} size="sm" dot>
          {rec.status === "lunas" ? "Lunas" : "Belum Lunas"}
        </Badge>
      ),
    },
    {
      key: "tanggal",
      header: "Tanggal Daftar",
      render: (rec) => (
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          {new Date(rec.tanggal).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout
        user={user}
        title="Rincian Keuangan Event"
        subtitle="Analisis pemasukan dari registrasi tiket dan akumulasi denda peserta."
        links={[]}
        onLogout={() => { localStorage.clear(); window.location.href = "/login"; }}
      >
        <div className="space-y-6 pb-10">
          <LoadingSkeleton variant="table" rows={5} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      user={user}
      title="Rincian Keuangan Event"
      subtitle={`Pemasukan registrasi dan denda${workshop?.judul ? ` untuk ${workshop.judul}` : ""}.`}
      links={[]}
      onLogout={() => { localStorage.clear(); window.location.href = "/login"; }}
    >
      <div className="space-y-6 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <StatCard
            title="Pemasukan (Lunas)"
            value={formatRupiah(stats?.total_pemasukan_lunas || 0)}
            icon="bi-check-circle"
            variant="success"
            subtitle="Uang tunai yang telah diterima"
          />
          <StatCard
            title="Piutang (Belum Lunas)"
            value={formatRupiah(stats?.total_pemasukan_belum_lunas || 0)}
            icon="bi-exclamation-circle"
            variant="warning"
            subtitle="Uang tertunda / belum diselesaikan"
          />
          <StatCard
            title="Estimasi Total Pendapatan"
            value={formatRupiah(stats?.grand_total || 0)}
            icon="bi-graph-up-arrow"
            variant="primary"
            subtitle="Total keseluruhan yang harusnya masuk"
          />
        </div>

        <Callout variant="info" title="Ringkasan Event" icon="bi-cash-coin">
          <p>
            Harga Tiket: <b>{formatRupiah(workshop?.harga || 0)}</b> • Denda Absen:{" "}
            <b>{formatRupiah(workshop?.nominal_denda || 0)}</b>
          </p>
        </Callout>

        <Card>
          <CardHeader>
            <CardTitle icon="bi-cash-stack">Rincian Aliran Dana</CardTitle>
            <CardTools>
              <Link
                href="/organizer/pendaftar"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <i className="bi bi-arrow-left" aria-hidden="true" />
                <span>Kembali</span>
              </Link>
            </CardTools>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:divide-x divide-slate-100 dark:divide-slate-800">
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">
                  1. Pemasukan Tiket Event
                </h4>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Registrasi Lunas:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(stats?.total_pendaftaran_lunas || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">
                    Registrasi Tertunda (Belum Lunas):
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {formatRupiah(stats?.total_pendaftaran_belum_lunas || 0)}
                  </span>
                </div>
                <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-2 flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-200">Subtotal Tiket:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {formatRupiah(
                      (stats?.total_pendaftaran_lunas || 0) +
                        (stats?.total_pendaftaran_belum_lunas || 0)
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-3 md:pl-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">
                  2. Pemasukan Denda Keterlambatan/Absen
                </h4>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">
                    Denda Terbayar (Lunas):
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(stats?.total_denda_lunas || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">
                    Denda Aktif (Belum Lunas):
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {formatRupiah(stats?.total_denda_belum_lunas || 0)}
                  </span>
                </div>
                <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-2 flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-200">Subtotal Denda:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {formatRupiah(
                      (stats?.total_denda_lunas || 0) + (stats?.total_denda_belum_lunas || 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="w-full lg:max-w-md">
            <Input
              icon="bi-search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama atau NIM peserta..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <i className="bi bi-funnel" aria-hidden="true" /> Filter:
            </div>
            <div className="min-w-[200px]">
              <Select
                value={filterTipe}
                onChange={(e) => {
                  setFilterTipe(e.target.value as typeof filterTipe);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: "Semua Jenis Pemasukan" },
                  { value: "pendaftaran", label: "Pendaftaran Event" },
                  { value: "denda", label: "Denda" },
                ]}
              />
            </div>
            <div className="min-w-[200px]">
              <Select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as typeof filterStatus);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: "Semua Status Pelunasan" },
                  { value: "lunas", label: "Lunas" },
                  { value: "belum_lunas", label: "Belum Lunas" },
                ]}
              />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle icon="bi-receipt">Transaksi Keuangan</CardTitle>
            <CardTools>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {filteredRecords.length} data
              </span>
            </CardTools>
          </CardHeader>

          <CardBody className="p-0">
            <DataTable
              columns={columns}
              data={paginatedRecords}
              keyExtractor={(rec) => rec.id}
              emptyTitle="Tidak ada data pemasukan"
              emptyMessage="Tidak ada data pemasukan yang cocok dengan saringan filter."
              className="rounded-none"
            />
          </CardBody>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={filteredRecords.length}
              onPageChange={setCurrentPage}
              className="border-t border-slate-100 dark:border-slate-800"
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
