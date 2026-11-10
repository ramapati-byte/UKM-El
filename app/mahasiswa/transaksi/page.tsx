"use client";

import { getBackendBaseUrl } from "@/lib/axios";
import { useEffect, useState } from "react";
import Link from "next/link";
import MahasiswaLayout from "../../../components/MahasiswaLayout";
import api from "../../../lib/api";
import AktivitasTabs from "../../../components/AktivitasTabs";
import Card, { CardBody, CardFooter, CardHeader, CardTitle } from "../../../components/ui/Card";
import StatCard from "../../../components/ui/StatCard";
import DataTable, { type Column } from "../../../components/ui/DataTable";
import Pagination from "../../../components/ui/Pagination";
import Badge from "../../../components/ui/Badge";
import Callout from "../../../components/ui/Callout";
import LoadingSkeleton from "../../../components/ui/LoadingSkeleton";

export default function RiwayatTransaksiPage() {
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/mahasiswa/transaksi");
        const data = res.data;
        const grouped = data.reduce((acc: any, curr: any) => {
          if (!acc[curr.kode_unik]) {
            acc[curr.kode_unik] = { ...curr, tickets: [] };
          }
          acc[curr.kode_unik].tickets.push(curr);
          return acc;
        }, {});

        const groupedArr = Object.values(grouped).sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setTransaksi(groupedArr);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const totalTrx = transaksi.length;
  const pendingTrx = transaksi.filter((t) => t.status_pembayaran === "pending").length;
  const successTrx = transaksi.filter(
    (t) => t.status_pembayaran === "paid" || t.status_pembayaran === "free"
  ).length;

  const totalPages = Math.ceil(transaksi.length / itemsPerPage);
  const paginatedTransaksi = transaksi.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="success" size="sm" dot>
            Lunas
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="warning" size="sm" dot>
            Menunggu Pembayaran
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="danger" size="sm" dot>
            Gagal / Expired
          </Badge>
        );
      case "free":
        return (
          <Badge variant="info" size="sm" dot>
            Gratis
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" size="sm">
            {status}
          </Badge>
        );
    }
  };

  const columns: Column<any>[] = [
    {
      key: "judul",
      header: "Event Info",
      width: "40%",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0 overflow-hidden">
            {row.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${getBackendBaseUrl()}/uploads/${row.poster}`}
                className="w-full h-full object-cover"
                alt={row.judul}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <i className="bi bi-calendar-event text-slate-500" aria-hidden="true" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-0.5 flex items-center gap-2">
              <span className="truncate max-w-[220px]">{row.judul}</span>
              {row.tickets.length > 1 && (
                <Badge variant="primary" size="sm">
                  {row.tickets.length} Tiket
                </Badge>
              )}
            </div>
            <div className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono inline-block">
              #{row.kode_unik}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Waktu Transaksi",
      render: (row) =>
        `${new Date(row.created_at).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })} WIB`,
    },
    {
      key: "status_pembayaran",
      header: "Status",
      align: "center",
      render: (row) => getStatusBadge(row.status_pembayaran),
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-2 items-center flex-wrap">
          {row.status_pembayaran === "pending" && row.payment_url ? (
            <>
              <span className="font-bold text-slate-700 dark:text-slate-200 font-mono text-sm">
                Rp {(Number(row.harga) * row.tickets.length).toLocaleString("id-ID")}
              </span>
              <a
                href={row.payment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold rounded-lg transition-colors"
              >
                <i className="bi bi-credit-card" aria-hidden="true" />
                Bayar
              </a>
            </>
          ) : row.status_pembayaran === "paid" || row.status_pembayaran === "free" ? (
            <Link
              href="/mahasiswa/tiket"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-xs font-bold rounded-lg transition-colors"
            >
              <i className="bi bi-ticket-perforated" aria-hidden="true" />
              Lihat {row.tickets.length} Tiket
            </Link>
          ) : (
            <span className="text-xs text-slate-400 italic">Closed</span>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <MahasiswaLayout>
        <div className="space-y-6 pb-10">
          <LoadingSkeleton variant="card" count={3} />
          <LoadingSkeleton variant="table" rows={6} />
        </div>
      </MahasiswaLayout>
    );
  }

  return (
    <MahasiswaLayout>
      <div className="space-y-6 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total Transaksi" value={totalTrx} icon="bi-receipt" variant="primary" />
          <StatCard
            title="Berhasil"
            value={successTrx}
            icon="bi-check-circle"
            variant="success"
            subtitle="Lunas / gratis"
          />
          {pendingTrx > 0 && (
            <StatCard
              title="Menunggu"
              value={pendingTrx}
              icon="bi-clock-history"
              variant="warning"
              subtitle="Perlu diselesaikan"
            />
          )}
        </div>

        <Card>
          <CardBody className="p-4">
            <AktivitasTabs />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle icon="bi-receipt">Riwayat Transaksi</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <DataTable
              columns={columns}
              data={paginatedTransaksi}
              keyExtractor={(row) => row.id}
              emptyTitle="Belum Ada Transaksi"
              emptyMessage="Anda belum mendaftar event apapun."
              className="rounded-none"
              renderMobileCard={(row) => {
                const borderColor =
                  row.status_pembayaran === "paid" || row.status_pembayaran === "free"
                    ? "bg-emerald-500"
                    : row.status_pembayaran === "pending"
                    ? "bg-amber-500"
                    : "bg-slate-300";
                return (
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${borderColor}`} />
                    <div className="pl-3">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug line-clamp-2">
                          {row.judul} {row.tickets.length > 1 && `(${row.tickets.length} Tiket)`}
                        </h3>
                       <div className="shrink-0">{getStatusBadge(row.status_pembayaran)}</div>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mb-3">
                        ID: #{row.kode_unik}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-300 mb-4 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg">
                        <div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">
                            Waktu
                          </p>
                          <p className="font-medium">
                            {new Date(row.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">
                            Total
                          </p>
                          <p className="font-bold text-slate-800 dark:text-slate-100">
                            {row.tipe_event === "gratis" || row.harga <= 0
                              ? "Free"
                              : `Rp ${(Number(row.harga) * row.tickets.length).toLocaleString("id-ID")}`}
                          </p>
                        </div>
                      </div>
                      {row.status_pembayaran === "pending" && row.payment_url && (
                        <a
                          href={row.payment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-2.5 rounded-lg text-xs transition-colors"
                        >
                          Bayar Sekarang
                        </a>
                      )}
                      {(row.status_pembayaran === "paid" || row.status_pembayaran === "free") && (
                        <Link
                          href="/mahasiswa/tiket"
                          className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-xs transition-colors"
                        >
                          Lihat {row.tickets.length} Tiket
                        </Link>
                      )}
                      {row.status_denda === "kena_denda" && (
                        <div className="mt-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg p-3 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <i className="bi bi-exclamation-triangle text-red-500" aria-hidden="true" />
                            <span className="text-xs font-bold text-red-600 dark:text-red-400">Denda</span>
                          </div>
                          <span className="font-bold text-red-700 dark:text-red-300 font-mono text-sm">
                            Rp {Number(row.nominal_denda).toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            />
          </CardBody>

          {totalPages > 1 && (
            <CardFooter className="block p-0">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={transaksi.length}
                onPageChange={setCurrentPage}
                className="border-t-0"
              />
            </CardFooter>
          )}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Callout
            variant="warning"
            title="Status Pending?"
            icon="bi-exclamation-triangle-fill"
          >
            Segera selesaikan pembayaran Anda. Transaksi kadaluwarsa akan dibatalkan otomatis.
          </Callout>
          <Callout variant="info" title="Metode Check-in" icon="bi-ticket-perforated-fill">
            Gunakan <b>E-Ticket</b> untuk check-in pada hari H acara.
          </Callout>
        </div>
      </div>
    </MahasiswaLayout>
  );
}
