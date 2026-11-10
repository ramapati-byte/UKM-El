"use client";

import { getBackendBaseUrl } from "@/lib/axios";
import { useEffect, useState } from "react";
import Link from "next/link";
import MahasiswaLayout from "../../../components/MahasiswaLayout";
import api from "../../../lib/api";
import AktivitasTabs from "../../../components/AktivitasTabs";
import Card, { CardBody } from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";
import LoadingSkeleton from "../../../components/ui/LoadingSkeleton";

export default function TiketSayaPage() {
  const [tikets, setTikets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/mahasiswa/tiket");
        setTikets(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <MahasiswaLayout>
      <div className="space-y-6 pb-10">
        <Card>
          <CardBody className="p-4">
            <AktivitasTabs />
          </CardBody>
        </Card>

        {loading ? (
          <LoadingSkeleton variant="card" count={6} />
        ) : tikets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {tikets.map((row: any) => {
              const isUpcoming = new Date(row.tanggal_waktu) > new Date();
              return (
                <Card key={row.id} className="flex flex-col h-full">
                  <div className="h-40 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                    {row.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${getBackendBaseUrl()}/uploads/${row.poster}`}
                        className="w-full h-full object-cover"
                        alt={row.judul}
                      />
                    ) : (
                      <div className="w-full h-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
                        <i
                          className="bi bi-calendar-event text-4xl text-indigo-300 dark:text-indigo-700"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge variant={isUpcoming ? "info" : "secondary"} size="sm" dot>
                        {isUpcoming ? "AKAN DATANG" : "SELESAI"}
                      </Badge>
                    </div>
                  </div>

                  <CardBody className="flex-1 flex flex-col">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg leading-snug mb-2 line-clamp-2">
                      {row.judul}
                    </h3>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                        <i className="bi bi-clock text-amber-500 mr-2 shrink-0" aria-hidden="true" />
                        <span>
                          {new Date(row.tanggal_waktu).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          WIB
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                        <i className="bi bi-geo-alt text-indigo-500 mr-2 shrink-0" aria-hidden="true" />
                        <span className="truncate">{row.lokasi}</span>
                      </div>
                    </div>

                    <div className="mt-auto border-t-2 border-dashed border-slate-200 dark:border-slate-800 pt-4 flex justify-between items-center gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">
                          Kode Tiket
                        </p>
                        <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-100 tracking-wide truncate">
                          {row.kode_unik}
                        </p>
                      </div>
                      <Link
                        href={`/mahasiswa/tiket/${btoa(row.id.toString())}`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
                      >
                        <i className="bi bi-qr-code" aria-hidden="true" />
                        Buka E-Ticket
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="bi-calendar-event"
            title="Belum Ada Jadwal"
            message="Anda belum terdaftar di event apapun."
            action={
              <Link
                href="/mahasiswa/katalog"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
              >
                <i className="bi bi-grid-3x3-gap" aria-hidden="true" />
                Lihat Katalog Event
              </Link>
            }
          />
        )}
      </div>
    </MahasiswaLayout>
  );
}
