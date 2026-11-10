"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import QRCode from "react-qr-code";
import Swal from "sweetalert2";
import MahasiswaLayout from "../../../../components/MahasiswaLayout";
import api from "../../../../lib/api";
import Card, { CardBody } from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import LoadingSkeleton from "../../../../components/ui/LoadingSkeleton";

export default function DetailTiketPage() {
  const router = useRouter();
  const params = useParams();

  let pendaftaran_id = params.id as string;
  if (params.id) {
    try {
      pendaftaran_id = atob(decodeURIComponent(params.id as string));
    } catch (e) {}
  }

  const [tiket, setTiket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/mahasiswa/tiket");
        const found = res.data.find((t: any) => t.id.toString() === pendaftaran_id);
        if (found) {
          setTiket(found);
        } else {
          Swal.fire("Error", "Tiket tidak ditemukan", "error").then(() =>
            router.push("/mahasiswa/tiket")
          );
        }
      } catch (err: any) {
        Swal.fire("Error", "Gagal memuat tiket", "error").then(() =>
          router.push("/mahasiswa/tiket")
        );
      } finally {
        setLoading(false);
      }
    };
    if (pendaftaran_id) fetch();
  }, [pendaftaran_id]);

  if (loading) {
    return (
      <MahasiswaLayout>
        <div className="space-y-6 pb-10">
          <LoadingSkeleton variant="card" count={1} />
        </div>
      </MahasiswaLayout>
    );
  }

  if (!tiket) return null;

  return (
    <MahasiswaLayout>
      <div className="space-y-6 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/mahasiswa/tiket"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <i className="bi bi-arrow-left" aria-hidden="true" />
            Kembali ke Tiket Saya
          </Link>
          <Button variant="outline" size="sm" icon="bi-printer" onClick={() => window.print()}>
            Cetak Tiket
          </Button>
        </div>

        <Card className="print:shadow-none print:border print:border-slate-200">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/3 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 border-dashed">
              <div className="flex items-center justify-between mb-6">
                <Badge variant="success" size="sm" dot>
                  E-Ticket Valid
                </Badge>
                <span className="text-slate-400 text-xs font-mono">BEM EVENT</span>
              </div>

              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight mb-6">
                {tiket.judul}
              </h1>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
                    <i className="bi bi-calendar-event text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-200">
                      {new Date(tiket.tanggal_waktu).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {new Date(tiket.tanggal_waktu).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      WIB - Selesai
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
                    <i className="bi bi-geo-alt text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-200">Lokasi Event</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug pr-4">
                      {tiket.lokasi}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Data Peserta
                </p>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                  {tiket.nama_peserta}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                  {tiket.email_peserta}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{tiket.telepon_peserta}</p>
              </div>
            </div>

            <div className="md:w-1/3 bg-slate-50 dark:bg-slate-800/40 p-6 sm:p-8 flex flex-col items-center justify-center">
              <div className="text-center mb-6 w-full">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Kode Registrasi
                </p>
                <p className="text-xl font-mono font-bold text-slate-800 dark:text-slate-100 tracking-widest">
                  {tiket.kode_unik}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700 w-full aspect-square flex items-center justify-center mb-6">
                <QRCode
                  value={tiket.kode_unik}
                  size={180}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox={`0 0 256 256`}
                />
              </div>

              <p className="text-center text-[10px] text-slate-500 dark:text-slate-400 px-4 leading-relaxed">
                Tunjukkan QR Code ini kepada panitia saat registrasi ulang di lokasi acara.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          .print\\:border { border: 1px solid #e2e8f0; }
          .print\\:shadow-none { box-shadow: none !important; }
        }
      `,
        }}
      />
    </MahasiswaLayout>
  );
}
