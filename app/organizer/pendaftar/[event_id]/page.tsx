"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "../../../../lib/api";
import DashboardLayout from "../../../../components/DashboardLayout";
import Swal from "sweetalert2";
import StatCard from "../../../../components/ui/StatCard";
import Card, {
  CardBody,
  CardHeader,
  CardTitle,
  CardTools,
} from "../../../../components/ui/Card";
import DataTable, { type Column } from "../../../../components/ui/DataTable";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Pagination from "../../../../components/ui/Pagination";
import LoadingSkeleton from "../../../../components/ui/LoadingSkeleton";

interface Pendaftar {
  id: number;
  nama_peserta: string;
  email_peserta: string;
  telepon_peserta: string;
  kode_unik: string;
  status_kehadiran: string;
  status_pembayaran: string;
  nim: string | null;
  prodi: string | null;
  sertifikat_predikat?: string | null;
}

interface EventData {
  id?: number;
  judul?: string;
  sertifikat_custom_type?: string | null;
}

export default function DetailPendaftarPage() {
  const router = useRouter();
  const params = useParams();
  const { event_id } = params;

  const [user, setUser] = useState<{ id?: number; name: string; email: string; role: string } | null>(null);
  const [pendaftar, setPendaftar] = useState<Pendaftar[]>([]);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const fetchData = async () => {
    try {
      setLoading(true);
      let decoded_id = event_id;
      try {
        decoded_id = atob(decodeURIComponent(event_id as string));
      } catch (e) {}

      const resEvent = await api.get(`/events/${decoded_id}`);
      setEventData(resEvent.data);

      const resPendaftar = await api.get(`/pendaftar/${decoded_id}`);
      setPendaftar(resPendaftar.data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Akses Ditolak",
        text: "Anda tidak memiliki akses ke event ini atau event tidak ditemukan.",
        confirmButtonColor: "#4f46e5",
      }).then(() => {
        router.push("/organizer/pendaftar");
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (event_id) fetchData();
  }, [event_id]);

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Peserta yang dihapus akan kehilangan tiket event ini secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/pendaftar/${id}`);
          Swal.fire("Terhapus!", "Peserta berhasil dihapus.", "success");
          fetchData();
        } catch (err) {
          console.error(err);
          Swal.fire("Error", "Gagal menghapus peserta.", "error");
        }
      }
    });
  };

  let global_decoded_id = event_id as string;
  try {
    global_decoded_id = atob(decodeURIComponent(event_id as string));
  } catch (e) {}

  const handleUpdatePredikat = async (pendaftar_id: number, predikat: string) => {
    try {
      await api.put(`/pendaftar/${global_decoded_id}/pendaftar/${pendaftar_id}/predikat`, { predikat });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal menyimpan predikat.", "error");
    }
  };

  const filteredPendaftar = pendaftar.filter(
    (p) =>
      p.nama_peserta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email_peserta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kode_unik.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPendaftar.length / itemsPerPage);
  const paginatedPendaftar = filteredPendaftar.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const hadirCount = pendaftar.filter((p) => p.status_kehadiran === "hadir").length;

  const columns: Column<Pendaftar>[] = [
    {
      key: "peserta",
      header: "Peserta",
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0">
            {p.nama_peserta.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
              {p.nama_peserta}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {p.prodi || p.nim || "Umum"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "kontak",
      header: "Kontak",
      render: (p) => (
        <div>
          <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{p.email_peserta}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{p.telepon_peserta || "-"}</p>
        </div>
      ),
    },
    {
      key: "kode_unik",
      header: "Kode Tiket",
      render: (p) => (
        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300 font-bold tracking-wide">
          {p.kode_unik}
        </span>
      ),
    },
  ];

  if (eventData?.sertifikat_custom_type === "per_peserta") {
    columns.push({
      key: "predikat",
      header: "Predikat",
      render: (p) => (
        <Input
          type="text"
          defaultValue={p.sertifikat_predikat || ""}
          onBlur={(e) => handleUpdatePredikat(p.id, e.target.value)}
          placeholder="Isi Predikat..."
          className="min-w-[140px] py-1.5 text-xs"
        />
      ),
    });
  }

  columns.push(
    {
      key: "status_pembayaran",
      header: "Status Pembayaran",
      align: "center",
      render: (p) => (
        <Badge
          variant={
            p.status_pembayaran === "paid"
              ? "success"
              : p.status_pembayaran === "free"
              ? "info"
              : "warning"
          }
          size="sm"
        >
          {p.status_pembayaran === "paid"
            ? "Lunas"
            : p.status_pembayaran === "free"
            ? "Gratis"
            : "Belum Lunas"}
        </Badge>
      ),
    },
    {
      key: "status_kehadiran",
      header: "Status Kehadiran",
      align: "center",
      render: (p) =>
        p.status_kehadiran === "hadir" ? (
          <Badge variant="success" size="sm" dot>
            Hadir
          </Badge>
        ) : (
          <Badge variant="warning" size="sm" dot>
            Belum Hadir
          </Badge>
        ),
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "center",
      render: (p) => (
        <Button
          variant="ghost"
          size="sm"
          icon="bi-trash"
          onClick={() => handleDelete(p.id)}
          title="Hapus Peserta"
          aria-label={`Hapus ${p.nama_peserta}`}
          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
        />
      ),
    }
  );

  if (loading) {
    return (
      <DashboardLayout
        user={user}
        title="Detail Pendaftar"
        subtitle="Kelola data pendaftar dan check-in peserta event."
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
      title="Detail Pendaftar"
      subtitle={`Kelola data pendaftar dan check-in untuk ${eventData?.judul || "event ini"}.`}
    >
      <div className="space-y-6 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Pendaftar"
            value={pendaftar.length}
            icon="bi-people"
            variant="primary"
          />
          <StatCard
            title="Hadir"
            value={hadirCount}
            icon="bi-check-circle"
            variant="success"
          />
          <StatCard
            title="Belum Hadir"
            value={pendaftar.length - hadirCount}
            icon="bi-hourglass-split"
            variant="warning"
          />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="w-full lg:max-w-md">
            <Input
              icon="bi-search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama peserta, email, atau kode tiket..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href="/organizer/pendaftar"
              className="inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <i className="bi bi-arrow-left" aria-hidden="true" />
              <span>Kembali</span>
            </Link>
            <Link
              href={`/organizer/pendaftar/${event_id}/scan`}
              className="inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <i className="bi bi-qr-code-scan" aria-hidden="true" />
              <span>Mulai Scan</span>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle icon="bi-people">Daftar Pendaftar</CardTitle>
            <CardTools>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {filteredPendaftar.length} data
              </span>
            </CardTools>
          </CardHeader>

          <CardBody className="p-0">
            <DataTable
              columns={columns}
              data={paginatedPendaftar}
              keyExtractor={(p) => p.id}
              emptyTitle="Tidak ada pendaftar"
              emptyMessage="Belum ada peserta yang cocok dengan pencarian Anda."
              className="rounded-none"
            />
          </CardBody>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={filteredPendaftar.length}
              onPageChange={setCurrentPage}
              className="border-t border-slate-100 dark:border-slate-800"
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
