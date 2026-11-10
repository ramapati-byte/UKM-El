"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MahasiswaLayout from "../../../components/MahasiswaLayout";
import api from "../../../lib/api";
import AktivitasTabs from "../../../components/AktivitasTabs";
import Card, { CardBody } from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import LoadingSkeleton from "../../../components/ui/LoadingSkeleton";

export default function SertifikatPage() {
  const [sertifikats, setSertifikats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/mahasiswa/sertifikat");
        setSertifikats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDownload = async (id: number, judul: string) => {
    try {
      const res = await api.get(`/mahasiswa/sertifikat/${id}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Sertifikat-${judul.replace(/[^a-zA-Z0-9]/g, "_")}.jpg`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Gagal mengunduh", err);
      alert("Gagal mengunduh sertifikat.");
    }
  };

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
        ) : sertifikats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {sertifikats.map((row: any) => {
              const isReady = !!row.sertifikat_template;
              const canDownload = row.is_kuesioner_active == 0 || row.is_filled > 0;
              return (
                <Card key={row.pendaftaran_id} className="flex flex-col h-full">
                  <div className="h-32 bg-slate-50 dark:bg-slate-800/40 relative flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                    <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-xs text-amber-500 border-4 border-slate-50 dark:border-slate-800">
                      <i className="bi bi-award text-3xl" aria-hidden="true" />
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant={isReady ? "success" : "secondary"} size="sm" dot>
                        {isReady ? "TERSEDIA" : "BELUM RILIS"}
                      </Badge>
                    </div>
                  </div>

                  <CardBody className="flex-1 flex flex-col text-center">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg leading-snug mb-2 line-clamp-2">
                      {row.judul}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                      <i className="bi bi-calendar3 mr-1" aria-hidden="true" />
                      {new Date(row.tanggal_waktu).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>

                    <div className="mt-auto">
                      {!isReady ? (
                        <Button variant="outline" icon="bi-clock" disabled className="w-full">
                          Belum Rilis
                        </Button>
                      ) : canDownload ? (
                        <Button
                          variant="warning"
                          icon="bi-download"
                          onClick={() => handleDownload(row.pendaftaran_id, row.judul)}
                          className="w-full"
                        >
                          Unduh Sertifikat
                        </Button>
                      ) : (
                        <div>
                          <Link
                            href={`/mahasiswa/kuesioner/${row.workshop_id}`}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-xs transition-colors"
                          >
                            <i className="bi bi-pencil-square" aria-hidden="true" />
                            Isi Kuesioner
                          </Link>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                            Wajib isi kuesioner untuk unduh.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="bi-award"
            title="Belum Ada Sertifikat"
            message='Pastikan status Anda "Hadir" di event yang diikuti.'
            action={
              <Link
                href="/mahasiswa/tiket"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
              >
                <i className="bi bi-ticket-perforated" aria-hidden="true" />
                Lihat Tiket Saya
              </Link>
            }
          />
        )}
      </div>
    </MahasiswaLayout>
  );
}
