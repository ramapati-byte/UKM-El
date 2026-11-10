"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import Card, {
  CardBody,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";

interface UserData {
  user_id: number;
  name: string;
  email: string;
  role: string;
}

interface OrganizerStats {
  active_events?: number;
  draft_events?: number;
  tickets_sold?: number;
  estimated_revenue?: number;
}

interface RecentEvent {
  id: number;
  judul: string;
  tanggal_waktu: string;
  total_registrants: number;
  status: string;
}

export default function OrganizerDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<OrganizerStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(recentEvents.length / itemsPerPage);
  const paginatedEvents = recentEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const storedUser =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    setUser(
      storedUser
        ? JSON.parse(storedUser)
        : {
            user_id: 2,
            name: "BEM El Rahma",
            email: "bem@elrahma.ac.id",
            role: "penyelenggara",
          }
    );
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/events/organizer/stats");
      setStats(res.data.stats);
      setRecentEvents(res.data.recent_events || []);
    } catch (err) {
      console.error("Gagal memuat stats penyelenggara:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const columns: Column<RecentEvent>[] = [
    {
      key: "judul",
      header: "Nama Event",
      width: "40%",
      render: (ev) => (
        <span
          className="font-semibold text-slate-800 dark:text-slate-100 truncate block max-w-[240px]"
          title={ev.judul}
        >
          {ev.judul}
        </span>
      ),
    },
    {
      key: "tanggal_waktu",
      header: "Tanggal",
      render: (ev) =>
        new Date(ev.tanggal_waktu).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
    },
    {
      key: "total_registrants",
      header: "Peserta",
      align: "center",
      render: (ev) => (
        <span className="font-bold text-slate-700 dark:text-slate-200">
          {ev.total_registrants}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (ev) => (
        <Badge
          variant={ev.status === "approved" ? "success" : "warning"}
          size="sm"
        >
          {ev.status === "approved" ? "PUBLISHED" : "DRAFT"}
        </Badge>
      ),
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "right",
      render: (ev) => (
        <Link
          href={`/organizer/pendaftar/${ev.id}`}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
        >
          Kelola
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout
      user={user}
      title="Dashboard Penyelenggara"
      subtitle={`${user?.name ?? "Penyelenggara"} — kelola semua event Anda di sini.`}
      links={[]}
      onLogout={handleLogout}
    >
      <div className="space-y-6 pb-10">
        <Card>
          <CardBody className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Selamat datang, {user?.name ?? "Penyelenggara"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pantau event, pendaftar, dan pendapatan Anda dalam satu tempat.
              </p>
            </div>
            <Link
              href="/organizer/create-event"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition-colors shrink-0"
            >
              <i className="bi bi-plus-lg text-base" aria-hidden="true" />
              <span>Buat Event Baru</span>
            </Link>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Event Aktif"
            value={stats?.active_events ?? 0}
            icon="bi-calendar-event"
            variant="primary"
          />
          <StatCard
            title="Event Draft"
            value={stats?.draft_events ?? 0}
            icon="bi-file-earmark-text"
            variant="secondary"
          />
          <StatCard
            title="Tiket Terjual"
            value={stats?.tickets_sold ?? 0}
            icon="bi-ticket-perforated"
            variant="success"
          />
          <StatCard
            title="Estimasi Pendapatan"
            value={formatRupiah(stats?.estimated_revenue ?? 0)}
            icon="bi-cash-coin"
            variant="warning"
            subtitle="Dari tiket lunas"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle icon="bi-clock-history">Event Terbaru Anda</CardTitle>
            <Link
              href="/organizer/events"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 inline-flex items-center gap-1"
            >
              Lihat Semua
              <i className="bi bi-arrow-right" aria-hidden="true" />
            </Link>
          </CardHeader>

          <CardBody className="p-0">
            <DataTable
              columns={columns}
              data={paginatedEvents}
              keyExtractor={(ev) => ev.id}
              loading={isLoading}
              emptyTitle="Belum ada event"
              emptyMessage="Mulai dengan membuat event pertama Anda."
              emptyAction={
                <Link
                  href="/organizer/create-event"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
                >
                  <i className="bi bi-plus-lg" aria-hidden="true" />
                  Buat Event Baru
                </Link>
              }
              className="rounded-none"
            />
          </CardBody>

          {totalPages > 1 && (
            <CardFooter className="block p-0">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={recentEvents.length}
                onPageChange={setCurrentPage}
                className="border-t-0"
              />
            </CardFooter>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
