// app/mahasiswa/kartu-anggota/page.tsx — Kartu anggota digital QR + unduh
"use client";

import { useState, useEffect, useRef } from "react";
import AppShell from "../../../components/shell/AppShell";
import { Card, CardBody, CardHeader, CardTitle } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import MemberStatusBadge from "../../../components/members/MemberStatusBadge";
import LoadingSkeleton from "../../../components/ui/LoadingSkeleton";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorState from "../../../components/ui/ErrorState";
import { memberService } from "../../../services/member.service";
import type { MemberCard } from "../../../types/member";

// QR code di-render via <img> dari API CDN (tidak perlu install library)
// eslint-disable-next-line @next/next/no-img-element
function QRCodeImage({ data, size = 160 }: { data: string; size?: number }) {
  const encoded = encodeURIComponent(data);
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=10`}
      alt="QR Code kartu anggota"
      width={size}
      height={size}
      className="rounded-xl"
    />
  );
}

export default function KartuAnggotaPage() {
  const [card, setCard]     = useState<MemberCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const getMahasiswaId = (): string => {
    if (typeof window === "undefined") return "1";
    try {
      const user = JSON.parse(localStorage.getItem("user") ?? "{}");
      return String(user.id ?? "1");
    } catch {
      return "1";
    }
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const mahasiswaId = getMahasiswaId();
      const c = await memberService.getMemberCard(mahasiswaId);
      setCard(c);
    } catch {
      setError("Gagal memuat kartu anggota. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownload = async () => {
    if (!card) return;
    setDownloading(true);
    try {
      // Buat versi cetak via <canvas> dengan data kartu
      const canvas = document.createElement("canvas");
      const W = 800;
      const H = 480;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Background gradien
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, "#4338ca");
      grad.addColorStop(1, "#6366f1");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 24);
      ctx.fill();

      // Garis dekoratif
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 80;
      ctx.beginPath();
      ctx.arc(W - 60, -60, 200, 0, Math.PI * 2);
      ctx.stroke();

      // Teks nama UKM
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText(card.ukmNama, 48, 72);

      // Label
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "16px sans-serif";
      ctx.fillText("KARTU ANGGOTA", 48, 104);

      // Avatar lingkaran
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.arc(100, 240, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.font = "bold 42px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(card.namaLengkap.charAt(0).toUpperCase(), 100, 256);
      ctx.textAlign = "left";

      // Info nama
      ctx.fillStyle = "white";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText(card.namaLengkap, 192, 204);

      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = "18px sans-serif";
      ctx.fillText(`NIM: ${card.nim}`, 192, 232);
      ctx.fillText(card.prodi ?? "", 192, 258);

      if (card.jabatan) {
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "16px sans-serif";
        ctx.fillText(`${card.jabatan}${card.divisi ? " — " + card.divisi : ""}`, 192, 282);
      }

      // Periode
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "14px sans-serif";
      ctx.fillText(card.periodeAktif, 192, 308);

      // Footer strip
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.roundRect(0, H - 64, W, 64, [0, 0, 24, 24]);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "13px sans-serif";
      ctx.fillText(`ID: ${card.id}`, 48, H - 24);

      // Download
      const url = canvas.toDataURL("image/png");
      const a   = document.createElement("a");
      a.href    = url;
      a.download = `kartu-anggota-${card.nim}.png`;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AppShell
      title="Kartu Anggota"
      subtitle="Kartu anggota digital UKM Anda"
      breadcrumbs={[
        { label: "Mahasiswa", href: "/mahasiswa/dashboard" },
        { label: "Kartu Anggota" },
      ]}
    >
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
        {loading ? (
          <LoadingSkeleton variant="card" rows={8} />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !card ? (
          <EmptyState
            icon="bi-credit-card-2-front"
            title="Belum Menjadi Anggota"
            message="Anda belum terdaftar sebagai anggota aktif UKM manapun. Daftarkan diri melalui open recruitment."
            action={
              <Button variant="primary" icon="bi-person-plus" onClick={() => window.location.href = "/mahasiswa/katalog"}>
                Jelajahi UKM
              </Button>
            }
          />
        ) : (
          <>
            {/* Kartu digital */}
            <div ref={cardRef}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-700 to-indigo-500 text-white p-7 min-h-[240px]">
                {/* Lingkaran dekoratif */}
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10" aria-hidden="true" />
                <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-white/5" aria-hidden="true" />

                {/* Header kartu */}
                <div className="relative flex items-start justify-between mb-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200 mb-0.5">
                      Kartu Anggota
                    </p>
                    <p className="text-lg font-bold">{card.ukmNama}</p>
                  </div>
                  <MemberStatusBadge status="aktif" />
                </div>

                {/* Body kartu */}
                <div className="relative flex items-center gap-5">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold shrink-0">
                    {card.namaLengkap.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xl font-bold truncate">{card.namaLengkap}</p>
                    <p className="text-sm text-indigo-200">{card.nim}</p>
                    {card.prodi && <p className="text-sm text-indigo-200 truncate">{card.prodi}</p>}
                    {(card.jabatan || card.divisi) && (
                      <p className="text-xs text-indigo-300 mt-1">
                        {[card.jabatan, card.divisi].filter(Boolean).join(" — ")}
                      </p>
                    )}
                    <p className="text-xs text-indigo-300 mt-1">
                      <i className="bi bi-calendar3 mr-1" />
                      {card.periodeAktif}
                    </p>
                  </div>
                </div>

                {/* ID kecil */}
                <div className="relative mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                  <p className="text-[10px] text-indigo-300 font-mono">{card.id}</p>
                  {card.validUntil && (
                    <p className="text-[10px] text-indigo-300">
                      Berlaku s/d{" "}
                      {new Date(card.validUntil).toLocaleDateString("id-ID", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* QR Code */}
            <Card>
              <CardHeader>
                <CardTitle icon="bi-qr-code">Kode QR Verifikasi</CardTitle>
              </CardHeader>
              <CardBody className="flex flex-col sm:flex-row items-center gap-6">
                <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                  <QRCodeImage data={card.qrData} size={160} />
                </div>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <p>
                    Tunjukkan kode QR ini saat verifikasi kehadiran, absensi UKM, atau peminjaman fasilitas.
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-mono break-all">
                    {card.qrData}
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Tombol unduh */}
            <Card>
              <CardBody className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">Unduh Kartu Anggota</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Simpan sebagai gambar PNG untuk ditampilkan secara digital.
                  </p>
                </div>
                <Button
                  variant="primary"
                  icon="bi-download"
                  loading={downloading}
                  onClick={handleDownload}
                >
                  Unduh PNG
                </Button>
              </CardBody>
            </Card>

            {/* Callout info */}
            <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl p-4 text-sm text-sky-800 dark:text-sky-300 flex items-start gap-3">
              <i className="bi bi-info-circle text-lg shrink-0 mt-0.5" />
              <p>
                Kartu anggota ini bersifat digital dan dapat diverifikasi langsung oleh pengurus UKM
                menggunakan scan QR. Jaga kerahasiaan data QR Anda.
              </p>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
