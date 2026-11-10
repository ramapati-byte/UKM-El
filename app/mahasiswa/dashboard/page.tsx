"use client";

import { getBackendBaseUrl } from "@/lib/axios";
import { useEffect, useState } from "react";
import Link from "next/link";
import MahasiswaLayout from "../../../components/MahasiswaLayout";
import api from "../../../lib/api";
import StatCard from "../../../components/ui/StatCard";
import Card, { CardBody, CardHeader, CardTitle } from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";
import LoadingSkeleton from "../../../components/ui/LoadingSkeleton";

export default function MahasiswaDashboard() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      setUser(
        stored
          ? JSON.parse(stored)
          : { id: 1, name: "Ahmad Fauzi", email: "ahmad.fauzi@elrahma.ac.id", role: "mahasiswa" }
      );
    }
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/mahasiswa/dashboard");
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = data?.stats || { event_diikuti: 0, tiket_aktif: 0, sertifikat: 0 };
  const tiketSaya = data?.tiket_saya || [];
  const agendas = data?.agendas || [];

  return (
    <MahasiswaLayout>
      <div className="space-y-6 pb-10">
        <Card>
          <CardBody className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Selamat datang, {user?.name || "Mahasiswa"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pantau kegiatan, cek jadwal event, dan kelola pendaftaran Anda dalam satu tempat.
              </p>
            </div>
            <Link
              href="/mahasiswa/katalog"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition-colors shrink-0"
            >
              <i className="bi bi-grid-3x3-gap text-base" aria-hidden="true" />
              <span>Jelajahi Katalog</span>
            </Link>
          </CardBody>
        </Card>

        {loading ? (
          <LoadingSkeleton variant="card" count={3} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Event Diikuti"
              value={stats.event_diikuti}
              icon="bi-calendar-event"
              variant="primary"
              subtitle="Seluruh riwayat pendaftaran"
            />
            <StatCard
              title="Tiket Aktif"
              value={stats.tiket_aktif}
              icon="bi-ticket-perforated"
              variant="success"
              subtitle="Event terdekat yang akan datang"
            />
            <StatCard
              title="E-Sertifikat"
              value={stats.sertifikat}
              icon="bi-award"
              variant="warning"
              subtitle="Klaim sertifikat Anda"
            />
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle icon="bi-ticket-perforated">Event Saya</CardTitle>
            {tiketSaya.length > 0 && (
              <Link
                href="/mahasiswa/tiket"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 inline-flex items-center gap-1"
              >
                Lihat Semua
                <i className="bi bi-arrow-right" aria-hidden="true" />
              </Link>
            )}
          </CardHeader>

          <CardBody>
            {loading ? (
              <LoadingSkeleton variant="card" count={3} />
            ) : tiketSaya.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {tiketSaya.map((row: any) => {
                  const isPaid = row.status_pembayaran === "paid" || row.status_pembayaran === "free";
                  return (
                    <div
                      key={row.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col"
                    >
                      <div className="h-36 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
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
                              className="bi bi-calendar-event text-3xl text-indigo-300 dark:text-indigo-700"
                              aria-hidden="true"
                            />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <Badge variant={isPaid ? "success" : "warning"} size="sm">
                            {isPaid ? "TERDAFTAR" : "MENUNGGU"}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                          {row.ukm_penyelenggara || "Event Kampus"}
                        </p>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
                          {row.judul}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                          <i className="bi bi-calendar3" aria-hidden="true" />
                          {new Date(row.tanggal_waktu).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <div className="mt-auto pt-3">
                          {isPaid ? (
                            <div className="w-full inline-flex items-center justify-center gap-1.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-lg">
                              <i className="bi bi-qr-code" aria-hidden="true" />
                              Buka E-Ticket
                            </div>
                          ) : (
                            <div className="w-full py-2 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-semibold text-center rounded-lg">
                              Menunggu Pembayaran
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon="bi-ticket-perforated"
                title="Belum ada event yang diikuti"
                message="Jelajahi katalog dan daftar event pertama Anda."
                action={
                  <Link
                    href="/mahasiswa/katalog"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
                  >
                    <i className="bi bi-grid-3x3-gap" aria-hidden="true" />
                    Jelajahi Katalog Event
                  </Link>
                }
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle icon="bi-calendar-event">Informasi &amp; Agenda</CardTitle>
          </CardHeader>

          <CardBody>
            {loading ? (
              <LoadingSkeleton variant="card" count={3} />
            ) : agendas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {agendas.map((agenda: any) => (
                  <div
                    key={agenda.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col"
                  >
                    <div className="h-40 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {agenda.poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`${getBackendBaseUrl()}/uploads/${agenda.poster}`}
                          className="w-full h-full object-cover"
                          alt={agenda.judul}
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
                        <Badge variant="secondary" size="sm">
                          {agenda.visibilitas ? agenda.visibilitas.toUpperCase() : "PUBLIC"}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                        {agenda.ukm_penyelenggara || "Event Kampus"}
                      </p>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 mb-2">
                        {agenda.judul}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
                        <span className="flex items-center gap-1">
                          <i className="bi bi-clock" aria-hidden="true" />
                          {new Date(agenda.tanggal_waktu).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <span className="flex items-center gap-1 truncate max-w-[110px]">
                          <i className="bi bi-geo-alt" aria-hidden="true" />
                          {agenda.lokasi}
                        </span>
                      </div>
                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          {agenda.tipe_event === "gratis"
                            ? "Gratis"
                            : `Rp ${Number(agenda.harga).toLocaleString("id-ID")}`}
                        </span>
                        <Link
                          href={`/mahasiswa/katalog/${agenda.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                        >
                          Detail
                          <i className="bi bi-arrow-right" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="bi-calendar-event"
                title="Belum ada agenda"
                message="Agenda event terbaru akan tampil di sini."
              />
            )}
          </CardBody>
        </Card>
      </div>
    </MahasiswaLayout>
  );
}
