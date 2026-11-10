// components/events/CertificateCommitteeSection.tsx — Konfigurasi & unduh sertifikat panitia

"use client";

import React, { useState, useRef } from "react";
import Card, { CardHeader, CardTitle, CardBody } from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Modal from "../ui/Modal";
import Swal from "sweetalert2";
import type { EventCommittee, EventEntity } from "../../types/event";
import { formatDateLong } from "../../lib/format";

interface CertificateCommitteeSectionProps {
  event: EventEntity;
  committees: EventCommittee[];
  className?: string;
}

export default function CertificateCommitteeSection({
  event,
  committees,
  className = "",
}: CertificateCommitteeSectionProps) {
  const [prefix, setPrefix] = useState("CERT-PANITIA");
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [previewMember, setPreviewMember] = useState<EventCommittee | null>(null);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate sertifikat panitia via HTML5 Canvas
  const generateCertificateCanvas = (
    c: EventCommittee,
    isDownload = false
  ): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current || document.createElement("canvas");
      const isLandscape = orientation === "landscape";
      canvas.width = isLandscape ? 1200 : 850;
      canvas.height = isLandscape ? 850 : 1200;

      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve("");

      // 1. Background gradient elegan
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, "#0f172a");
      grad.addColorStop(0.5, "#1e1b4b");
      grad.addColorStop(1, "#0f172a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Ornamen Garis & Bingkai Emas
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

      // 3. Header Sertifikat
      ctx.fillStyle = "#fcd34d";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        (event.ukm_name || "BADAN EKSEKUTIF MAHASISWA").toUpperCase(),
        canvas.width / 2,
        isLandscape ? 130 : 180
      );

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 48px sans-serif";
      ctx.fillText(
        "SERTIFIKAT PENGHARGAAN",
        canvas.width / 2,
        isLandscape ? 200 : 260
      );

      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px sans-serif";
      ctx.fillText(
        `Nomor: ${prefix}/${event.id}/${String(c.id).padStart(4, "0")}`,
        canvas.width / 2,
        isLandscape ? 235 : 300
      );

      // 4. Keterangan "Diberikan kepada"
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "italic 18px sans-serif";
      ctx.fillText(
        "Diberikan sebagai bentuk apresiasi dan dedikasi kepada:",
        canvas.width / 2,
        isLandscape ? 310 : 400
      );

      // 5. Nama Panitia (Besar)
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 44px sans-serif";
      ctx.fillText(c.name, canvas.width / 2, isLandscape ? 385 : 490);

      // 6. Peran & Nama Kegiatan
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "20px sans-serif";
      ctx.fillText(
        `Atas kontribusi aktif sebagai ${c.role.toUpperCase()} (${c.division || "Panitia"})`,
        canvas.width / 2,
        isLandscape ? 450 : 570
      );

      ctx.fillStyle = "#93c5fd";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(
        `pada kegiatan "${event.title}"`,
        canvas.width / 2,
        isLandscape ? 495 : 625
      );

      // 7. Tanggal & Tanda Tangan
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px sans-serif";
      ctx.fillText(
        `Dilaksanakan pada: ${formatDateLong(event.starts_at)} • ${event.location}`,
        canvas.width / 2,
        isLandscape ? 550 : 690
      );

      // Footer Signatures
      const sigY = isLandscape ? 670 : 850;
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("Ketua BEM / UKM", canvas.width * 0.28, sigY);
      ctx.fillText("Ketua Pelaksana Event", canvas.width * 0.72, sigY);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.18, sigY + 60);
      ctx.lineTo(canvas.width * 0.38, sigY + 60);
      ctx.moveTo(canvas.width * 0.62, sigY + 60);
      ctx.lineTo(canvas.width * 0.82, sigY + 60);
      ctx.stroke();

      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText("(Tanda Tangan & Cap)", canvas.width * 0.28, sigY + 80);
      ctx.fillText("(Tanda Tangan)", canvas.width * 0.72, sigY + 80);

      const dataUrl = canvas.toDataURL("image/png");

      if (isDownload) {
        const link = document.createElement("a");
        link.download = `Sertifikat-Panitia-${c.name.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
        link.href = dataUrl;
        link.click();
      }

      resolve(dataUrl);
    });
  };

  const handleDownloadSingle = async (c: EventCommittee) => {
    setGeneratingId(c.id);
    try {
      await generateCertificateCanvas(c, true);
      Swal.fire({
        icon: "success",
        title: "Sertifikat Diunduh!",
        text: `Sertifikat panitia untuk ${c.name} berhasil dibuat dan diunduh.`,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire("Gagal", "Terjadi kesalahan saat memproses sertifikat.", "error");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDownloadAll = async () => {
    if (committees.length === 0) return;
    Swal.fire({
      title: "Unduh Semua Sertifikat Panitia?",
      text: `Sistem akan membuat dan mengunduh ${committees.length} sertifikat panitia secara berurutan.`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Ya, Unduh Semua",
      cancelButtonText: "Batal",
    }).then(async (res) => {
      if (res.isConfirmed) {
        for (const c of committees) {
          await generateCertificateCanvas(c, true);
          await new Promise((r) => setTimeout(r, 400));
        }
      }
    });
  };

  return (
    <Card className={className}>
      {/* Hidden Canvas untuk Rendering */}
      <canvas ref={canvasRef} className="hidden" />

      <CardHeader>
        <CardTitle icon="bi-award-fill">E-Sertifikat Panitia Pelaksana</CardTitle>
        <div className="flex items-center gap-2">
          {committees.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon="bi-download"
              onClick={handleDownloadAll}
              className="font-bold"
            >
              Unduh Semua ({committees.length})
            </Button>
          )}
        </div>
      </CardHeader>

      <CardBody className="space-y-6">
        {/* Form Pengaturan Singkat Format Sertifikat */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Prefix Penomoran Sertifikat"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            placeholder="CERT-PANITIA"
            helper="Format nomor sertifikat panitia"
          />

          <Select
            label="Orientasi Dokumen"
            value={orientation}
            onChange={(e) => setOrientation(e.target.value as "landscape" | "portrait")}
            options={[
              { value: "landscape", label: "Landscape (Horizontal)" },
              { value: "portrait", label: "Portrait (Vertikal)" },
            ]}
            helper="Tata letak sertifikat"
          />

          <div className="flex flex-col justify-end pb-1">
            <span className="text-xs text-slate-500 mb-1.5 font-semibold">Status Generator</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              <i className="bi bi-check-circle-fill" aria-hidden="true" />
              <span>Otomatisasi Canvas Aktif</span>
            </span>
          </div>
        </div>

        {/* Tabel Panitia & Tombol Unduh Sertifikat */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Daftar Panitia Siap Terbit Sertifikat ({committees.length})
            </h4>
          </div>

          {committees.length === 0 ? (
            <div className="text-center py-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-4 text-xs text-slate-500">
              Belum ada panitia terdaftar untuk event ini. Tambahkan panitia di tab &quot;Panitia Pelaksana&quot; untuk menerbitkan sertifikat.
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Nama Panitia</th>
                    <th className="px-4 py-3">Peran / Jabatan</th>
                    <th className="px-4 py-3">Divisi</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {committees.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-100">
                        {c.name}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="primary" size="sm">
                          {c.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {c.division || "Umum"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="success" size="sm" dot>
                          Siap Cetak
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            icon="bi-eye"
                            onClick={() => setPreviewMember(c)}
                            title="Preview Sertifikat"
                          >
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            icon="bi-download"
                            loading={generatingId === c.id}
                            onClick={() => handleDownloadSingle(c)}
                            title="Unduh Sertifikat PNG"
                          >
                            Unduh
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardBody>

      {/* Modal Preview Sertifikat */}
      {previewMember && (
        <Modal
          open={Boolean(previewMember)}
          onClose={() => setPreviewMember(null)}
          title={`Pratinjau Sertifikat — ${previewMember.name}`}
          size="lg"
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreviewMember(null)}>
                Tutup
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon="bi-download"
                onClick={() => {
                  handleDownloadSingle(previewMember);
                  setPreviewMember(null);
                }}
              >
                Unduh Sertifikat Ini
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-center">
            <p className="text-xs text-slate-500">
              Pratinjau sertifikat penghargaan untuk <b>{previewMember.name}</b> sebagai{" "}
              <b>{previewMember.role}</b>:
            </p>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden shadow-inner flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  canvasRef.current
                    ? canvasRef.current.toDataURL("image/png")
                    : ""
                }
                alt="Preview Sertifikat"
                className="max-h-96 w-auto object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
}
