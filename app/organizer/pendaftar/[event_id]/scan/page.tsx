"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "../../../../../lib/api";
import DashboardLayout from "../../../../../components/DashboardLayout";
import { Html5QrcodeScanner } from "html5-qrcode";
import Swal from "sweetalert2";
import Card, { CardBody, CardFooter, CardHeader, CardTitle } from "../../../../../components/ui/Card";
import Button from "../../../../../components/ui/Button";
import Callout from "../../../../../components/ui/Callout";
import LoadingSkeleton from "../../../../../components/ui/LoadingSkeleton";

interface ScanEvent {
  id?: number;
  judul?: string;
}

interface ScanPeserta {
  nama_peserta?: string;
}

interface ScanResult {
  success: boolean;
  message: string;
  data?: ScanPeserta;
}

export default function ScanCheckinPage() {
  const router = useRouter();
  const params = useParams();
  const { event_id } = params;

  const [user, setUser] = useState<{ id?: number; name: string; email: string; role: string } | null>(null);
  const [eventData, setEventData] = useState<ScanEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const isProcessing = useRef(false);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        let decoded_id = event_id as string;
        try {
          decoded_id = atob(decodeURIComponent(event_id as string));
        } catch (e) {}
        const res = await api.get(`/events/${decoded_id}`);
        setEventData(res.data);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Event tidak ditemukan", "error").then(() =>
          router.push("/organizer/pendaftar")
        );
      } finally {
        setLoading(false);
      }
    };
    if (event_id) fetchData();
  }, [event_id]);

  useEffect(() => {
    if (!loading) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [0] },
        false
      );

      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, [loading]);

  const onScanSuccess = async (decodedText: string) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    try {
      let decoded_id = event_id as string;
      try {
        decoded_id = atob(decodeURIComponent(event_id as string));
      } catch (e) {}
      const res = await api.post(`/pendaftar/${decoded_id}/scan`, { kode_unik: decodedText });

      setScanResult({
        success: true,
        message: res.data.message,
        data: res.data.peserta,
      });

      setTimeout(() => {
        setScanResult(null);
        isProcessing.current = false;
      }, 3000);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setScanResult({
        success: false,
        message: apiErr.response?.data?.message || "Gagal memproses QR Code",
      });

      setTimeout(() => {
        setScanResult(null);
        isProcessing.current = false;
      }, 3000);
    }
  };

  const onScanFailure = () => {
    // ignore
  };

  if (loading) {
    return (
      <DashboardLayout
        user={user}
        title="Scan Check-in"
        subtitle="Presensi peserta menggunakan QR tiket."
      >
        <div className="space-y-6 pb-10">
          <LoadingSkeleton variant="table" rows={4} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      user={user}
      title="Scan Check-in"
      subtitle={`Presensi peserta${eventData?.judul ? ` — ${eventData.judul}` : ""}.`}
    >
      <div className="max-w-xl mx-auto space-y-5 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/organizer/pendaftar/${event_id}`}
            className="inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <i className="bi bi-arrow-left" aria-hidden="true" />
            <span>Kembali</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <i className="bi bi-camera-video" aria-hidden="true" />
            Kamera aktif
          </span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle icon="bi-qr-code-scan">{eventData?.judul || "Scan Check-in"}</CardTitle>
          </CardHeader>

          <CardBody className="relative space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Arahkan kamera ke QR tiket peserta untuk mencatat kehadiran.
            </p>

            <div
              id="reader"
              className="w-full bg-slate-900 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700"
            />

            {scanResult && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm animate-in fade-in duration-200 rounded-xl">
                {scanResult.success ? (
                  <>
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-lg">
                      <i className="bi bi-check-circle-fill text-4xl" aria-hidden="true" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 text-center">
                      {scanResult.message}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-6 text-center">
                      {scanResult.data?.nama_peserta}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-950/60 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-4 shadow-lg">
                      <i className="bi bi-x-octagon-fill text-4xl" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 text-center">
                      Check-in Gagal
                    </h3>
                    <p className="text-red-500 dark:text-red-400 font-medium mb-6 text-center">
                      {scanResult.message}
                    </p>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  icon="bi-arrow-repeat"
                  onClick={() => {
                    setScanResult(null);
                    isProcessing.current = false;
                  }}
                >
                  Lanjut Scan
                </Button>
              </div>
            )}
          </CardBody>

          <CardFooter className="justify-center text-center">
            <span className="inline-flex items-center gap-1.5">
              <i className="bi bi-shield-check" aria-hidden="true" />
              Check-in otomatis membutuhkan izin akses kamera.
            </span>
          </CardFooter>
        </Card>

        <Callout variant="info" title="Petunjuk" icon="bi-info-circle">
          Pastikan pencahayaan cukup dan QR tiket berada di dalam kotak pemindai. Hasil scan
          akan hilang otomatis setelah beberapa detik.
        </Callout>
      </div>
    </DashboardLayout>
  );
}
