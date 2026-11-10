// components/events/AttendanceSummary.tsx — Ringkasan presensi & kehadiran peserta event

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Card, { CardHeader, CardTitle, CardBody } from "../ui/Card";
import Button from "../ui/Button";
import LoadingSkeleton from "../ui/LoadingSkeleton";
import Callout from "../ui/Callout";
import { eventService } from "../../services/event.service";
import type { AttendanceSummary as AttendanceSummaryType } from "../../types/event";
import { formatRupiah, formatDateTime } from "../../lib/format";

interface AttendanceSummaryProps {
  eventId: number;
  penaltyAmount?: number;
  className?: string;
}

export default function AttendanceSummary({
  eventId,
  penaltyAmount = 0,
  className = "",
}: AttendanceSummaryProps) {
  const [summary, setSummary] = useState<AttendanceSummaryType | null>(null);
  const [loading, setLoading] = useState<boolean>(() => Boolean(eventId && !isNaN(eventId)));

  useEffect(() => {
    let isMounted = true;
    if (!eventId || isNaN(eventId)) {
      return;
    }

    eventService
      .getAttendanceSummary(eventId)
      .then((data) => {
        if (isMounted) setSummary(data);
      })
      .catch(() => {
        if (isMounted) {
          setSummary({
            event_id: eventId,
            total_registrants: 0,
            total_attendees: 0,
            attendance_rate: 0,
          });
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  if (loading) {
    return <LoadingSkeleton variant="table" rows={3} className={className} />;
  }

  const registrants = summary?.total_registrants || 0;
  const attendees = summary?.total_attendees || 0;
  const absent = Math.max(0, registrants - attendees);
  const rate = registrants > 0 ? Math.round((attendees / registrants) * 100) : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle icon="bi-qr-code-scan">Ringkasan Presensi & Kehadiran</CardTitle>
        <div className="flex items-center gap-2">
          <Link href={`/organizer/pendaftar/${eventId}/scan`}>
            <Button variant="primary" size="sm" icon="bi-camera" className="font-bold">
              Buka Scanner
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardBody className="space-y-5">
        {/* Progress Bar Persentase Hadir */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Tingkat Partisipasi Hadir</span>
            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
              {rate}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                rate >= 75
                  ? "bg-emerald-500"
                  : rate >= 40
                  ? "bg-indigo-600"
                  : "bg-amber-500"
              }`}
              style={{ width: `${Math.min(100, rate)}%` }}
            />
          </div>
        </div>

        {/* 3 Metrik Utama: Pendaftar, Hadir, Belum Hadir */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total Pendaftar
            </p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {registrants}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Peserta Terdaftar</p>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Sudah Check-in
            </p>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">
              {attendees}
            </p>
            <p className="text-[11px] text-emerald-600/70 mt-0.5">Tervalidasi Hadir</p>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Belum Hadir
            </p>
            <p className="text-xl sm:text-2xl font-extrabold text-amber-700 dark:text-amber-300 mt-0.5">
              {absent}
            </p>
            <p className="text-[11px] text-amber-600/70 mt-0.5">Menunggu Scan</p>
          </div>
        </div>

        {/* Informasi Denda Kehadiran (jika berlaku) */}
        {penaltyAmount > 0 && absent > 0 && (
          <Callout
            variant="warning"
            title="Kebijakan Denda Ketidakhadiran Berlaku"
            icon="bi-exclamation-diamond-fill"
          >
            Terdapat <b>{absent} peserta</b> yang belum check-in. Event ini menerapkan denda sebesar{" "}
            <b>{formatRupiah(penaltyAmount)}</b> per peserta yang mangkir. Rekap denda otomatis terakumulasi pada laporan keuangan event.
          </Callout>
        )}

        {/* Waktu Scan Terakhir */}
        {summary?.last_scan_at && (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center sm:text-left flex items-center gap-1.5 justify-center sm:justify-start">
            <i className="bi bi-clock-history text-slate-400" aria-hidden="true" />
            <span>Scan presensi terakhir: {formatDateTime(summary.last_scan_at)}</span>
          </p>
        )}

        {/* Quick Link Buttons */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <Link href={`/organizer/pendaftar/${eventId}`}>
            <Button variant="outline" size="sm" icon="bi-people">
              Daftar Peserta & Unduh Excel
            </Button>
          </Link>
          <Link href={`/organizer/pendaftar/${eventId}/keuangan`}>
            <Button variant="outline" size="sm" icon="bi-cash-coin">
              Lihat Rekap Kas & Denda
            </Button>
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
