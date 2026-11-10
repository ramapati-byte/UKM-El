"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "../../../lib/api";
import DashboardLayout from "../../../components/DashboardLayout";
import StatCard from "../../../components/ui/StatCard";
import Card, { CardBody } from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";
import LoadingSkeleton from "../../../components/ui/LoadingSkeleton";
import { getBackendBaseUrl } from "@/lib/axios";
import Swal from "sweetalert2";

interface EventStats {
  id: number;
  judul: string;
  lokasi: string;
  tanggal_waktu: string;
  poster: string | null;
  jumlah_pendaftar: number;
  jumlah_hadir: number;
  tipe_event: string;
  harga: number;
}

export default function KelolaPendaftarPage() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [events, setEvents] = useState<EventStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      setUser(
        storedUser
          ? JSON.parse(storedUser)
          : { name: "BEM El Rahma", email: "bem@elrahma.ac.id", role: "penyelenggara" }
      );
    }
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/pendaftar");
      setEvents(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Gagal memuat data pendaftar.",
        confirmButtonColor: "#4f46e5",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const filteredEvents = events.filter((e) =>
    e.judul.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPendaftar = events.reduce((acc, curr) => acc + curr.jumlah_pendaftar, 0);

  return (
    <DashboardLayout
      user={user}
      title="Data Pendaftar"
      subtitle="Pantau peserta dari semua event, status pembayaran, dan kehadiran."
      links={[]}
      onLogout={handleLogout}
    >
      <div className="space-y-6 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Total Event"
            value={events.length}
            icon="bi-calendar-event"
            variant="primary"
          />
          <StatCard
            title="Total Pendaftar"
            value={totalPendaftar}
            icon="bi-people"
            variant="success"
          />
        </div>

        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="bi bi-search text-slate-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari event berdasarkan judul..."
            className="block w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
          />
        </div>

        {loading ? (
          <LoadingSkeleton variant="card" rows={3} />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            icon="bi-people"
            title="Tidak ada event ditemukan"
            message="Belum ada event atau pencarian tidak cocok."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredEvents.map((event) => (
              <Card key={event.id}>
                <CardBody className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-48 h-40 md:h-28 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0">
                    {event.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${getBackendBaseUrl()}/uploads/${event.poster}`}
                        alt={event.judul}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <i className="bi bi-image text-2xl" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
                        {event.judul}
                      </h3>
                      <Badge
                        variant={event.tipe_event === "berbayar" ? "primary" : "success"}
                        size="sm"
                      >
                        {event.tipe_event === "berbayar" ? "Berbayar" : "Gratis"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <i className="bi bi-calendar3" aria-hidden="true" />
                        {new Date(event.tanggal_waktu).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <i className="bi bi-geo-alt" aria-hidden="true" />
                        <span className="truncate max-w-[220px]">{event.lokasi}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-6 mt-3">
                      <div>
                        <span className="block text-xl font-bold text-slate-800 dark:text-slate-100 leading-none">
                          {event.jumlah_pendaftar}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                          Pendaftar
                        </span>
                      </div>
                      <div>
                        <span className="block text-xl font-bold text-emerald-600 dark:text-emerald-400 leading-none">
                          {event.jumlah_hadir}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-wider">
                          Hadir
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center md:flex-col gap-2 shrink-0 md:justify-center">
                    {event.tipe_event === "berbayar" && (
                      <Link
                        href={`/organizer/pendaftar/${btoa(event.id.toString())}/keuangan`}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Keuangan Event"
                      >
                        <i className="bi bi-cash-coin" aria-hidden="true" />
                        Keuangan
                      </Link>
                    )}
                    <Link
                      href={`/organizer/pendaftar/${btoa(event.id.toString())}`}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs transition-colors"
                      title="Detail Pendaftar"
                    >
                      <i className="bi bi-eye" aria-hidden="true" />
                      Detail
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
