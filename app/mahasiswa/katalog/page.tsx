"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MahasiswaLayout from "../../../components/MahasiswaLayout";
import Card, { CardBody } from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";
import LoadingSkeleton from "../../../components/ui/LoadingSkeleton";
import { getBackendBaseUrl } from "@/lib/axios";
import api from "../../../lib/api";

interface KatalogEvent {
  id: number;
  judul: string;
  deskripsi?: string;
  poster: string | null;
  tanggal_waktu: string;
  lokasi: string;
  visibilitas?: string;
  tipe_event?: string;
  harga: number;
  ukm_penyelenggara?: string;
  is_registered?: number;
}

export default function KatalogEventPage() {
  const [events, setEvents] = useState<KatalogEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipe, setFilterTipe] = useState("all");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.set("q", searchTerm);
        if (filterTipe !== "all") params.set("tipe", filterTipe);
        const res = await api.get(`/mahasiswa/katalog?${params.toString()}`);
        setEvents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchEvents, 400);
    return () => clearTimeout(debounce);
  }, [searchTerm, filterTipe]);

  return (
    <MahasiswaLayout>
      <div className="space-y-6 pb-10">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="bi bi-search text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari judul event, topik, atau lokasi..."
              className="block w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
          </div>
          <select
            value={filterTipe}
            onChange={(e) => setFilterTipe(e.target.value)}
            className="md:min-w-[180px] px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">Semua Tipe</option>
            <option value="gratis">Gratis (Free)</option>
            <option value="berbayar">Berbayar (Paid)</option>
          </select>
        </div>

        {loading ? (
          <LoadingSkeleton variant="card" count={6} />
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {events.map((row) => {
              const isFree = row.tipe_event === "gratis" || row.harga <= 0;
              const isRegistered = Number(row.is_registered) > 0;
              return (
                <Card key={row.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                  <div className="h-44 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                    {row.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${getBackendBaseUrl()}/uploads/${row.poster}`}
                        alt={row.judul}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
                        <i className="bi bi-calendar-event text-4xl text-indigo-300 dark:text-indigo-700" aria-hidden="true" />
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <Badge variant="secondary" size="sm">
                        {row.visibilitas ? row.visibilitas.toUpperCase() : "PUBLIC"}
                      </Badge>
                      {isRegistered && (
                        <Badge variant="success" size="sm" dot>
                          Terdaftar
                        </Badge>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <Badge variant={isFree ? "info" : "warning"} size="sm">
                        {isFree ? "FREE" : `Rp ${Number(row.harga).toLocaleString("id-ID")}`}
                      </Badge>
                    </div>
                  </div>

                  <CardBody className="flex-1 flex flex-col">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mb-2">
                      <span className="inline-flex items-center gap-1.5">
                        <i className="bi bi-calendar3" aria-hidden="true" />
                        {new Date(row.tanggal_waktu).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1.5 min-w-0">
                        <i className="bi bi-geo-alt" aria-hidden="true" />
                        <span className="truncate max-w-[140px]">{row.lokasi}</span>
                      </span>
                    </div>

                    <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                      {row.ukm_penyelenggara || "Event Kampus"}
                    </p>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
                      {row.judul}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {row.deskripsi ? `${row.deskripsi.substring(0, 100)}...` : ""}
                    </p>

                    <div className="mt-auto pt-4">
                      <Link
                        href={`/mahasiswa/katalog/${row.id}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition-colors"
                      >
                        <i className="bi bi-ticket-perforated" aria-hidden="true" />
                        Daftar Sekarang
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="bi-search"
            title="Event Tidak Ditemukan"
            message="Maaf, kami tidak menemukan event yang sesuai dengan pencarian Anda."
            action={
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setFilterTipe("all");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
              >
                <i className="bi bi-arrow-counterclockwise" aria-hidden="true" />
                Reset Pencarian
              </button>
            }
          />
        )}
      </div>
    </MahasiswaLayout>
  );
}
