// app/events/[id]/EventDetailClient.tsx — Komponen client detail event publik

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Swal from "sweetalert2";
import PublicShell from "@/components/shell/PublicShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import { eventService } from "@/services/event.service";
import type { EventEntity } from "@/types/event";
import {
  formatRupiah,
  formatDateLong,
  formatTime,
  relativeDate,
} from "@/lib/format";
import { getBackendBaseUrl } from "@/lib/env";

export default function EventDetailClient() {
  const params = useParams();
  const idStr = params.id as string;
  const eventId = Number(idStr);

  const [event, setEvent] = useState<EventEntity | null>(null);
  const [loading, setLoading] = useState<boolean>(() => Boolean(eventId && !isNaN(eventId)));

  useEffect(() => {
    let isMounted = true;
    if (!eventId || isNaN(eventId)) {
      return;
    }

    eventService
      .getPublicEventById(eventId)
      .then((data) => {
        if (isMounted) setEvent(data);
      })
      .catch(() => {
        if (isMounted) setEvent(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          Swal.fire({
            icon: "success",
            title: "Tautan Disalin!",
            text: "Tautan agenda kegiatan telah berhasil disalin ke clipboard.",
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
          });
        }
      } catch {
        prompt("Salin tautan event berikut:", url);
      }
    }
  };

  const handleAddToCalendar = () => {
    if (!event) return;
    const start = new Date(event.starts_at)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");
    const end = event.ends_at
      ? new Date(event.ends_at).toISOString().replace(/-|:|\.\d\d\d/g, "")
      : new Date(new Date(event.starts_at).getTime() + 2 * 60 * 60 * 1000)
          .toISOString()
          .replace(/-|:|\.\d\d\d/g, "");

    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${start}/${end}&details=${encodeURIComponent(
      event.description
    )}&location=${encodeURIComponent(event.location)}`;

    window.open(googleCalUrl, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <PublicShell>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
          <LoadingSkeleton variant="text" rows={5} />
        </div>
      </PublicShell>
    );
  }

  if (!event) {
    return (
      <PublicShell>
        <div className="max-w-3xl mx-auto px-4 py-20">
          <EmptyState
            icon="bi-shield-lock"
            title="Event Tidak Ditemukan atau Bersifat Internal"
            message="Kegiatan yang Anda cari mungkin belum disetujui, bersifat privat internal UKM, atau tautan yang Anda tuju sudah tidak berlaku."
            action={
              <Link href="/events">
                <Button variant="primary" icon="bi-arrow-left">
                  Kembali ke Katalog Event
                </Button>
              </Link>
            }
          />
        </div>
      </PublicShell>
    );
  }

  const isFree = event.type === "free" || event.price <= 0;
  const posterSrc = event.poster_url
    ? event.poster_url.startsWith("http")
      ? event.poster_url
      : `${getBackendBaseUrl()}${event.poster_url.startsWith("/") ? "" : "/"}${event.poster_url}`
    : null;

  const isQuotaFull =
    event.max_participants > 0 &&
    (event.counts?.registrants || 0) >= event.max_participants;

  return (
    <PublicShell>
      <div className="pb-24">
        {/* Breadcrumb Navigation */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <nav aria-label="Breadcrumb" className="text-xs text-slate-500 dark:text-slate-400">
              <ol className="flex items-center gap-2 list-none p-0 m-0 flex-wrap">
                <li>
                  <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1">
                    <i className="bi bi-house" aria-hidden="true" />
                    <span>Beranda</span>
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/events" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Katalog Event
                  </Link>
                </li>
                <li>/</li>
                <li className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs sm:max-w-md">
                  {event.title}
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Hero Banner Section */}
        <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Media Poster Preview */}
              <div className="w-full lg:w-96 shrink-0 aspect-video lg:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-800 border-2 border-white/10 shadow-2xl relative">
                {posterSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={posterSrc}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white/50 bg-gradient-to-br from-indigo-800 to-slate-900">
                    <i className="bi bi-calendar-event text-6xl mb-3 opacity-40" aria-hidden="true" />
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-60">
                      {event.ukm_name || "Event Kampus"}
                    </p>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-md ${
                      isFree ? "bg-emerald-500 text-white" : "bg-amber-400 text-amber-950"
                    }`}
                  >
                    {isFree ? "GRATIS" : formatRupiah(event.price)}
                  </span>
                </div>
              </div>

              {/* Title & Key Highlights */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary" size="sm" className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30">
                    <i className="bi bi-building mr-1.5" aria-hidden="true" />
                    {event.ukm_name || "BEM El Rahma"}
                  </Badge>
                  <Badge variant="success" size="sm">
                    <i className="bi bi-patch-check-fill mr-1" aria-hidden="true" />
                    Terverifikasi
                  </Badge>
                  <span className="text-xs text-indigo-200/70 font-medium">
                    {relativeDate(event.starts_at)}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-snug">
                  {event.title}
                </h1>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm text-indigo-100/90">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                    <i className="bi bi-calendar-check text-amber-400 text-lg shrink-0" aria-hidden="true" />
                    <div className="truncate">
                      <p className="font-bold text-white truncate">{formatDateLong(event.starts_at)}</p>
                      <p className="text-xs text-indigo-200/70">
                        Pukul {formatTime(event.starts_at)}
                        {event.ends_at && ` - ${formatTime(event.ends_at)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                    <i className="bi bi-geo-alt text-indigo-400 text-lg shrink-0" aria-hidden="true" />
                    <div className="truncate">
                      <p className="font-bold text-white truncate">{event.location}</p>
                      <p className="text-xs text-indigo-200/70">
                        {event.room_name || "Lokasi Acara"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Share & Calendar */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon="bi-share"
                    onClick={handleShare}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Bagikan
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon="bi-calendar-plus"
                    onClick={handleAddToCalendar}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Simpan ke Google Calendar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Left (Details) & Right (Registration Card) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Column (65%) */}
            <div className="w-full lg:w-2/3 space-y-6">
              {/* Deskripsi Lengkap Card */}
              <Card>
                <CardHeader>
                  <CardTitle icon="bi-card-text">Tentang Kegiatan Ini</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {event.description}
                  </div>
                </CardBody>
              </Card>

              {/* Syarat & Ketentuan / Ketentuan Denda (jika aktif) */}
              {event.penalty_amount > 0 && (
                <Card outline outlineColor="warning">
                  <CardHeader>
                    <CardTitle icon="bi-exclamation-triangle-fill">
                      Ketentuan Kehadiran & Komitmen
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      <p>
                        Event ini menerapkan kebijakan <b>komitmen kehadiran</b>. Peserta yang telah mendaftar namun tidak hadir pada saat pelaksanaan tanpa konfirmasi akan dikenakan denda komitmen sebesar:
                      </p>
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 font-bold text-amber-900 dark:text-amber-200 text-sm flex items-center gap-2">
                        <i className="bi bi-cash-coin text-lg" aria-hidden="true" />
                        <span>Nominal Denda: {formatRupiah(event.penalty_amount)}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Denda ini bertujuan menjaga alokasi kuota agar peserta yang benar-benar berkomitmen dapat memanfaatkan kesempatan belajar dengan maksimal.
                      </p>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Sponsor & Partner (jika ada) */}
              {event.sponsors && event.sponsors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle icon="bi-award-fill">Sponsor & Media Partner</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                      {event.sponsors.map((sp) => (
                        <div
                          key={sp.id}
                          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center flex flex-col items-center justify-center gap-2"
                        >
                          {sp.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={sp.logo_url.startsWith("http") ? sp.logo_url : `${getBackendBaseUrl()}${sp.logo_url}`}
                              alt={sp.name}
                              className="h-10 w-auto object-contain"
                            />
                          ) : (
                            <i className="bi bi-building text-2xl text-slate-400" aria-hidden="true" />
                          )}
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-full">
                            {sp.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>

            {/* Right Column (35%): Sticky Action Card */}
            <div className="w-full lg:w-1/3 lg:sticky lg:top-20 space-y-4">
              <Card className="border-indigo-200 dark:border-indigo-900/50 shadow-lg">
                <CardHeader className="bg-indigo-50/70 dark:bg-indigo-950/40">
                  <div className="w-full flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Biaya Registrasi
                    </span>
                    <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                      {isFree ? "Gratis" : formatRupiah(event.price)}
                    </span>
                  </div>
                </CardHeader>

                <CardBody className="space-y-4">
                  {/* Status Kuota */}
                  {event.max_participants > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <span>Kapasitas Peserta:</span>
                        <span>
                          {event.counts?.registrants || 0} / {event.max_participants}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isQuotaFull ? "bg-red-500" : "bg-indigo-600"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                ((event.counts?.registrants || 0) / event.max_participants) * 100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                      {isQuotaFull && (
                        <p className="text-[11px] font-bold text-red-600 dark:text-red-400">
                          <i className="bi bi-x-circle-fill mr-1" aria-hidden="true" />
                          Mohon maaf, kuota peserta sudah penuh!
                        </p>
                      )}
                    </div>
                  )}

                  {/* Ringkasan Agenda */}
                  <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-start gap-2">
                      <i className="bi bi-calendar-event text-indigo-500 text-sm mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{formatDateLong(event.starts_at)}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <i className="bi bi-clock text-amber-500 text-sm mt-0.5 shrink-0" aria-hidden="true" />
                      <span>
                        Pukul {formatTime(event.starts_at)}
                        {event.ends_at && ` - ${formatTime(event.ends_at)}`}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <i className="bi bi-geo-alt text-red-500 text-sm mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <i className="bi bi-qr-code text-slate-500 text-sm mt-0.5 shrink-0" aria-hidden="true" />
                      <span>E-Tiket & Presensi Scan QR Otomatis</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <i className="bi bi-award text-emerald-500 text-sm mt-0.5 shrink-0" aria-hidden="true" />
                      <span>E-Sertifikat Resmi Peserta</span>
                    </div>
                  </div>

                  {/* CTA Pendaftaran Langsung (Tanpa Wajib Login) */}
                  <div className="pt-2">
                    <Link
                      href={`/mahasiswa/katalog/${event.id}`}
                      className="w-full block"
                    >
                      <Button
                        variant="primary"
                        size="lg"
                        disabled={isQuotaFull}
                        className="w-full font-bold shadow-md hover:shadow-lg"
                        icon="bi-pencil-square"
                      >
                        {isQuotaFull ? "Kuota Penuh" : "Daftar Event Ini"}
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>

              {/* Tautan ke Kalender & Agenda Lain */}
              <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Ingin melihat seluruh jadwal kegiatan kampus?
                </p>
                <Link href="/events" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                  <i className="bi bi-grid-3x3-gap" aria-hidden="true" />
                  <span>Jelajahi Agenda Lengkap</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
