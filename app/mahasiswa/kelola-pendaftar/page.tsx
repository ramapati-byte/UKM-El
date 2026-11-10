"use client";

import { getBackendBaseUrl } from "@/lib/axios";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "../../../lib/api";
import MahasiswaLayout from "../../../components/MahasiswaLayout";
import Swal from "sweetalert2";
import StatCard from "../../../components/ui/StatCard";
import Card, { CardBody } from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import EmptyState from "../../../components/ui/EmptyState";
import LoadingSkeleton from "../../../components/ui/LoadingSkeleton";

interface EventPanitia {
  id: number;
  judul: string;
  lokasi: string;
  tanggal_waktu: string;
  poster: string | null;
  jumlah_pendaftar: number;
  jumlah_hadir: number;
  tipe_event: string;
  role: string;
}

export default function KelolaPendaftarMahasiswaPage() {
  const [events, setEvents] = useState<EventPanitia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/mahasiswa/panitia-events");
      setEvents(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Gagal memuat data event kepanitiaan.",
        confirmButtonColor: "#4f46e5",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((e) =>
    e.judul.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPendaftar = events.reduce((acc, curr) => acc + curr.jumlah_pendaftar, 0);

  return (
    <MahasiswaLayout>
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

        <div className="w-full lg:max-w-md">
          <Input
            icon="bi-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari event kepanitiaan..."
          />
        </div>

        {loading ? (
          <LoadingSkeleton variant="card" count={3} />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            icon="bi-people"
            title="Tidak ada event"
            message="Anda belum menjadi panitia aktif di event manapun atau pencarian tidak cocok."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-64 h-48 md:h-auto bg-slate-100 dark:bg-slate-800 relative shrink-0">
                    {event.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${getBackendBaseUrl()}/uploads/${event.poster}`}
                        alt={event.judul}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                        <i className="bi bi-image text-3xl" aria-hidden="true" />
                        <span className="text-[10px] font-bold uppercase tracking-wider mt-1">
                          No Image
                        </span>
                      </div>
                    )}
                  </div>

                  <CardBody className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div className="min-w-0">
                      <Badge variant="primary" size="sm">
                        Peran: {event.role}
                      </Badge>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mt-2 mb-1 line-clamp-2">
                        {event.judul}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 inline-flex items-center gap-2">
                        <i className="bi bi-calendar3 text-emerald-600" aria-hidden="true" />
                        {new Date(event.tanggal_waktu).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 shrink-0">
                      <div className="text-center">
                        <span className="block text-2xl font-bold text-slate-800 dark:text-slate-100">
                          {event.jumlah_pendaftar}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest">
                          Pendaftar
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="block text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {event.jumlah_hadir}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-widest">
                          Hadir
                        </span>
                      </div>
                      <Link
                        href={`/mahasiswa/kelola-pendaftar/${btoa(event.id.toString())}`}
                        className="inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                        title="Detail Pendaftar"
                      >
                        <i className="bi bi-eye" aria-hidden="true" />
                        <span>Kelola</span>
                      </Link>
                    </div>
                  </CardBody>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MahasiswaLayout>
  );
}
