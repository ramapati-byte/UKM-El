"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBackendBaseUrl } from "@/lib/axios";
import api from "../lib/axios";
import PublicShell from "@/components/shell/PublicShell";
import Card, { CardBody } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface LandingEvent {
  id: number;
  judul: string;
  poster: string | null;
  tipe_event?: string;
  harga: number;
  ukm_penyelenggara?: string;
  tanggal_waktu: string;
  lokasi: string;
  deskripsi?: string;
}

const FEATURES = [
  {
    title: "Program Akademik",
    description:
      "Workshop, seminar, dan pendampingan akademik untuk meningkatkan kompetensi mahasiswa di berbagai bidang.",
    icon: "bi-journal-bookmark",
    accent: "border-t-indigo-600",
    iconBg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400",
  },
  {
    title: "Pengabdian Masyarakat",
    description:
      "Kegiatan sosial dan pemberdayaan masyarakat untuk mengasah kepekaan sosial mahasiswa.",
    icon: "bi-people",
    accent: "border-t-emerald-600",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Kewirausahaan Mahasiswa",
    description:
      "Program pengembangan ide bisnis, pelatihan enterpreneurship, dan inkubasi usaha untuk mendukung kemandirian mahasiswa.",
    icon: "bi-lightbulb",
    accent: "border-t-amber-500",
    iconBg: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400",
  },
];

const MISI = [
  "Mengembangkan potensi mahasiswa melalui berbagai program kreatif",
  "Memperkuat jaringan dan kolaborasi dengan berbagai pihak",
  "Menjadi representasi aspirasi mahasiswa yang profesional",
  "Menyelenggarakan kegiatan yang bermanfaat untuk kampus dan masyarakat",
];

export default function Home() {
  const [workshops, setWorkshops] = useState<LandingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const response = await api.get("/events");
        setWorkshops(response.data);
      } catch (error) {
        console.error("Failed to fetch workshops:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options) + " WIB";
  };

  return (
    <PublicShell brandTitle="BEM El Rahma">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10 pb-20">
        {/* Jumbotron */}
        <section className="rounded-2xl bg-slate-900 border border-slate-800 text-white px-6 py-10 sm:px-10 sm:py-14">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-200 text-xs font-bold uppercase tracking-wider">
              <i className="bi bi-mortarboard" aria-hidden="true" />
              Badan Eksekutif Mahasiswa
            </span>

            <h1 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
              BEM El Rahma — Wadah Kreativitas &amp; Inovasi
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Badan Eksekutif Mahasiswa yang berkomitmen mengembangkan potensi
              mahasiswa melalui berbagai program kreatif, inovatif, dan bermanfaat
              untuk kemajuan bersama.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                href="/events"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
              >
                <i className="bi bi-calendar-event" aria-hidden="true" />
                Ikuti Kegiatan
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors"
              >
                <i className="bi bi-person-plus" aria-hidden="true" />
                Daftar Anggota
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <i className="bi bi-box-arrow-in-right" aria-hidden="true" />
                Masuk
              </Link>
            </div>
          </div>
        </section>

        {/* Program Unggulan */}
        <section className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Program Unggulan
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Berbagai program unggulan yang diselenggarakan BEM El Rahma untuk
              pengembangan diri dan kontribusi sosial mahasiswa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature) => (
              <Card
                key={feature.title}
                className={`border-t-4 ${feature.accent} h-full`}
              >
                <CardBody className="flex flex-col gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${feature.iconBg}`}
                  >
                    <i className={`bi ${feature.icon}`} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {/* Tentang BEM */}
        <section id="profil" className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Tentang BEM El Rahma
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              BEM El Rahma merupakan organisasi mahasiswa yang menjadi wadah
              pengembangan diri, kreativitas, dan kepemimpinan mahasiswa untuk
              mencapai visi bersama.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            <Card className="overflow-hidden">
              <div className="relative h-full min-h-[280px] bg-slate-100 dark:bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/sunat_bareng.jpeg"
                  alt="Kegiatan BEM"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shrink-0">
                      <i className="bi bi-award" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Visi &amp; Misi BEM El Rahma
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Wadah pengembangan mahasiswa yang unggul
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-5">
              <Card outline outlineColor="primary">
                <CardBody>
                  <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
                    <i
                      className="bi bi-lightning-charge text-indigo-600 dark:text-indigo-400"
                      aria-hidden="true"
                    />
                    Visi Kami
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Menjadi wadah pengembangan mahasiswa yang unggul, inovatif,
                    dan berkontribusi positif untuk kemajuan kampus dan
                    masyarakat.
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
                    <i
                      className="bi bi-check-circle text-emerald-600 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                    Misi Kami
                  </h3>
                  <ul className="space-y-2.5">
                    {MISI.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <i
                          className="bi bi-check-circle-fill text-emerald-500 text-sm mt-0.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            </div>
          </div>
        </section>

        {/* Katalog Event */}
        <section id="agenda" className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Katalog Event Terbaru
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                Jangan lewatkan kesempatan untuk berkembang. Daftar event yang
                sedang buka registrasi sekarang!
              </p>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              Lihat Semua Event
              <i className="bi bi-arrow-right" aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <LoadingSkeleton variant="card" count={3} />
          ) : workshops.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {workshops.map((workshop) => {
                const isPaid =
                  workshop.tipe_event === "berbayar" || workshop.harga > 0;
                return (
                  <Card
                    key={workshop.id}
                    className="flex flex-col h-full hover:shadow-md transition-shadow"
                  >
                    <div className="h-44 bg-slate-100 dark:bg-slate-800 relative overflow-hidden shrink-0">
                      {workshop.poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`${getBackendBaseUrl()}/uploads/${workshop.poster}`}
                          alt={workshop.judul}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop";
                          }}
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
                          <i className="bi bi-globe2 mr-1" aria-hidden="true" />
                          Publik
                        </Badge>
                      </div>

                      <div className="absolute top-3 right-3">
                        <Badge
                          variant={isPaid ? "warning" : "success"}
                          size="sm"
                        >
                          {isPaid
                            ? `Rp ${Number(workshop.harga).toLocaleString("id-ID")}`
                            : "GRATIS"}
                        </Badge>
                      </div>
                    </div>

                    <CardBody className="flex-1 flex flex-col">
                      <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1.5">
                        {workshop.ukm_penyelenggara || "Event Kampus"}
                      </div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 mb-2">
                        {workshop.judul}
                      </h3>

                      <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <i
                            className="bi bi-clock text-indigo-500 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="truncate">
                            {formatDate(workshop.tanggal_waktu)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <i
                            className="bi bi-geo-alt text-indigo-500 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="truncate">{workshop.lokasi}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed flex-1">
                        {workshop.deskripsi}
                      </p>

                      <div className="mt-auto pt-4">
                        <Link
                          href={`/events/${workshop.id}`}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition-colors"
                        >
                          <i
                            className="bi bi-ticket-perforated"
                            aria-hidden="true"
                          />
                          Detail &amp; Daftar
                        </Link>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon="bi-calendar-x"
              title="Belum Ada Event Terbuka"
              message="Saat ini belum ada event publik yang dibuka. Pantau terus halaman ini untuk update event kampus selanjutnya."
              action={
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
                >
                  <i className="bi bi-calendar-event" aria-hidden="true" />
                  Lihat Katalog Event
                </Link>
              }
            />
          )}
        </section>
      </div>
    </PublicShell>
  );
}
