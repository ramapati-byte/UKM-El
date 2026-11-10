// components/events/EventReportExport.tsx — Ekspor laporan kegiatan (PDF/Cetak & Excel CSV)

"use client";

import React, { useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Swal from "sweetalert2";
import type { EventEntity, EventCommittee, EventLPJ } from "../../types/event";
import { formatRupiah, formatDateLong, formatDateTime } from "../../lib/format";

interface EventReportExportProps {
  event: EventEntity;
  committees?: EventCommittee[];
  lpj?: EventLPJ | null;
  className?: string;
}

export default function EventReportExport({
  event,
  committees = [],
  lpj,
  className = "",
}: EventReportExportProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  // 1. Ekspor Dokumen Cetak / PDF
  const handlePrintPDF = () => {
    setExporting(true);
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      Swal.fire("Perhatian", "Izinkan pop-up browser untuk mencetak laporan.", "warning");
      setExporting(false);
      return;
    }

    const registrants = event.counts?.registrants || 0;
    const attendees = event.counts?.attendees || 0;
    const rate = registrants > 0 ? Math.round((attendees / registrants) * 100) : 0;
    const budgetPlanned = lpj?.budget_planned || 0;
    const budgetRealized = lpj?.budget_realized || 0;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>Laporan Kegiatan — ${event.title}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 30px; color: #1e293b; font-size: 13px; line-height: 1.5; }
          .header { border-bottom: 3px double #0f172a; padding-bottom: 12px; margin-bottom: 20px; text-align: center; }
          .header h1 { font-size: 18px; margin: 0; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; }
          .header h2 { font-size: 14px; margin: 4px 0 0 0; color: #4338ca; }
          .meta-table, .data-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
          .meta-table td { padding: 5px 8px; vertical-align: top; }
          .meta-table td.label { width: 25%; font-weight: bold; color: #475569; }
          .data-table th, .data-table td { border: 1px solid #cbd5e1; padding: 7px 10px; text-align: left; }
          .data-table th { background: #f1f5f9; font-weight: bold; font-size: 11px; text-transform: uppercase; color: #334155; }
          .section-title { font-size: 14px; font-weight: bold; border-left: 4px solid #4f46e5; padding-left: 8px; margin: 18px 0 8px 0; color: #1e1b4b; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
          .badge-success { background: #dcfce7; color: #15803d; }
          .footer-sign { margin-top: 40px; display: flex; justify-content: space-between; page-break-inside: avoid; }
          .sign-box { text-align: center; width: 200px; }
          .sign-line { margin-top: 60px; border-top: 1px solid #334155; }
          @media print { body { margin: 15mm; } button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SISTEM PENGELOLAAN UKM — BEM EL RAHMA</h1>
          <h2>LAPORAN PERTANGGUNGJAWABAN KEGIATAN EVENT</h2>
          <p style="font-size: 11px; color: #64748b; margin-top: 4px;">Dicetak pada: ${new Date().toLocaleString("id-ID")}</p>
        </div>

        <div class="section-title">1. INFORMASI KEGIATAN</div>
        <table class="meta-table">
          <tr><td class="label">Judul Kegiatan</td><td><b>${event.title}</b></td></tr>
          <tr><td class="label">Penyelenggara</td><td>${event.ukm_name || "BEM El Rahma"}</td></tr>
          <tr><td class="label">Waktu Pelaksanaan</td><td>${formatDateLong(event.starts_at)} • ${formatDateTime(event.starts_at)}</td></tr>
          <tr><td class="label">Lokasi / Ruangan</td><td>${event.location} ${event.room_name ? `(${event.room_name})` : ""}</td></tr>
          <tr><td class="label">Tipe & Biaya</td><td>${event.type === "free" ? "Gratis" : formatRupiah(event.price)}</td></tr>
          <tr><td class="label">Status Event</td><td><span class="badge badge-success">${event.status}</span></td></tr>
        </table>

        <div class="section-title">2. REALISASI PESERTA & PRESENSI</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Total Pendaftar</th>
              <th>Peserta Hadir</th>
              <th>Tingkat Kehadiran</th>
              <th>Kapasitas Kuota</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>${registrants} Orang</b></td>
              <td><b>${attendees} Orang</b></td>
              <td><b>${rate}%</b></td>
              <td>${event.max_participants > 0 ? `${event.max_participants} Orang` : "Tanpa Batas"}</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">3. REALISASI ANGGARAN & LPJ</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Anggaran Rencana</th>
              <th>Realisasi Pengeluaran</th>
              <th>Selisih / Sisa</th>
              <th>Status LPJ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${formatRupiah(budgetPlanned)}</td>
              <td><b>${formatRupiah(budgetRealized)}</b></td>
              <td><b>${formatRupiah(budgetPlanned - budgetRealized)}</b></td>
              <td>${lpj?.status ? lpj.status.toUpperCase() : "DRAFT"}</td>
            </tr>
          </tbody>
        </table>
        ${
          lpj?.summary
            ? `<div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; margin-top: 8px; font-size: 12px;"><b>Ringkasan Pelaksanaan:</b><br/>${lpj.summary}</div>`
            : ""
        }

        <div class="section-title">4. SUSUNAN PANITIA PELAKSANA (${committees.length} Orang)</div>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 30px;">No</th>
              <th>Nama Panitia</th>
              <th>Jabatan / Role</th>
              <th>Divisi</th>
              <th>Kontak</th>
            </tr>
          </thead>
          <tbody>
            ${
              committees.length > 0
                ? committees
                    .map(
                      (c, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><b>${c.name}</b></td>
                  <td>${c.role}</td>
                  <td>${c.division || "Umum"}</td>
                  <td>${c.email || c.phone || "-"}</td>
                </tr>`
                    )
                    .join("")
                : '<tr><td colspan="5" style="text-align: center; color: #94a3b8;">Belum ada panitia terdaftar</td></tr>'
            }
          </tbody>
        </table>

        <div class="footer-sign">
          <div class="sign-box">
            <p>Mengetahui,<br/><b>Ketua UKM / BEM</b></p>
            <div class="sign-line"></div>
            <p style="font-size: 11px; color: #64748b;">(Tanda Tangan & Cap)</p>
          </div>
          <div class="sign-box">
            <p>Penanggung Jawab,<br/><b>Ketua Pelaksana</b></p>
            <div class="sign-line"></div>
            <p style="font-size: 11px; color: #64748b;">${committees.find((c) => c.role.toLowerCase().includes("ketua"))?.name || "(Nama Jelas)"}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      setExporting(false);
    }, 500);
  };

  // 2. Ekspor File Excel CSV (UTF-8 BOM)
  const handleExportCSV = () => {
    const rows = [
      ["LAPORAN KEGIATAN EVENT"],
      ["Sistem Pengelolaan UKM - BEM El Rahma"],
      [""],
      ["INFORMASI KEGIATAN"],
      ["ID Event", event.id],
      ["Judul", event.title],
      ["Penyelenggara", event.ukm_name || "BEM El Rahma"],
      ["Waktu", event.starts_at],
      ["Lokasi", event.location],
      ["Ruangan", event.room_name || "-"],
      ["Biaya", event.type === "free" ? "Gratis" : event.price],
      ["Status", event.status],
      [""],
      ["STATISTIK PESERTA"],
      ["Total Pendaftar", event.counts?.registrants || 0],
      ["Total Hadir", event.counts?.attendees || 0],
      ["Kuota Maksimal", event.max_participants],
      [""],
      ["ANGGARAN LPJ"],
      ["Anggaran Rencana", lpj?.budget_planned || 0],
      ["Realisasi Anggaran", lpj?.budget_realized || 0],
      ["Status LPJ", lpj?.status || "draft"],
      [""],
      ["SUSUNAN PANITIA"],
      ["No", "Nama Panitia", "Jabatan", "Divisi", "Email", "Telepon"],
      ...committees.map((c, i) => [
        i + 1,
        c.name,
        c.role,
        c.division || "Umum",
        c.email || "-",
        c.phone || "-",
      ]),
    ];

    const csvContent =
      "\uFEFF" +
      rows
        .map((r) =>
          r
            .map((item) => `"${String(item ?? "").replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Laporan_Event_${event.id}_${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      icon: "success",
      title: "File Excel CSV Diunduh!",
      text: "Laporan rekap kegiatan berhasil diekspor.",
      timer: 1800,
      showConfirmButton: false,
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        icon="bi-file-earmark-arrow-down"
        onClick={() => setModalOpen(true)}
        className={className}
      >
        Ekspor Laporan Event
      </Button>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Ekspor Laporan & LPJ Kegiatan"
        size="md"
        footer={
          <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
            Tutup
          </Button>
        }
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Pilih format dokumen ekspor laporan untuk event <b>&ldquo;{event.title}&rdquo;</b>:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Opsi 1: PDF / Cetak */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between gap-3 text-left">
              <div>
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center text-xl mb-2">
                  <i className="bi bi-file-earmark-pdf-fill" aria-hidden="true" />
                </div>
                <h5 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                  Dokumen Cetak / PDF
                </h5>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Format dokumen siap cetak resmi dilengkapi kop surat, tabel rekap, dan kolom tanda tangan.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon="bi-printer"
                loading={exporting}
                onClick={handlePrintPDF}
                className="w-full"
              >
                Cetak / Simpan PDF
              </Button>
            </div>

            {/* Opsi 2: Excel CSV */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between gap-3 text-left">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-xl mb-2">
                  <i className="bi bi-file-earmark-excel-fill" aria-hidden="true" />
                </div>
                <h5 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                  Lembar Kerja Excel (CSV)
                </h5>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Format data mentah untuk analisis angka anggaran, data panitia, dan perbandingan kehadiran.
                </p>
              </div>
              <Button
                variant="success"
                size="sm"
                icon="bi-file-earmark-spreadsheet"
                onClick={handleExportCSV}
                className="w-full font-bold"
              >
                Unduh File Excel
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
