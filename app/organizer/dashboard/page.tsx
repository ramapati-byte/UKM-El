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
import Button from "@/components/ui/Button";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import { dashboardService } from "@/services/dashboard.service";
import type { TaskItem } from "@/types/dashboard";
import { formatDateShort } from "@/lib/format";

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
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [exporting, setExporting] = useState(false);

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
      const [res, taskData] = await Promise.all([
        api.get("/events/organizer/stats"),
        dashboardService.getTasks(),
      ]);
      setStats(res.data.stats);
      setRecentEvents(res.data.recent_events || []);
      setTasks(taskData);
    } catch (err) {
      console.error("Gagal memuat stats penyelenggara:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const blob = await dashboardService.exportPdf();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "laporan-kegiatan-ukm.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal mengunduh laporan PDF");
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const blob = await dashboardService.exportExcel();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rekap-kegiatan-ukm.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal mengunduh laporan Excel");
    } finally {
      setExporting(false);
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

        {/* Export Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Laporan Kegiatan & Evaluasi
            </h2>
            <p className="text-xs text-slate-500">
              Unduh rekapitulasi kegiatan, pendaftar, dan keuangan organisasi
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={exporting}
              onClick={handleExportPdf}
            >
              <i className="bi bi-file-earmark-pdf mr-1 text-danger" aria-hidden="true" />
              Ekspor PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={exporting}
              onClick={handleExportExcel}
            >
              <i className="bi bi-file-earmark-excel mr-1 text-success" aria-hidden="true" />
              Ekspor Excel
            </Button>
          </div>
        </div>

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

        {/* Section Event & Tugas Tertunda */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
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

          {/* Tugas Tertunda Widget */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle icon="bi-check2-square">Tugas Tertunda</CardTitle>
              </CardHeader>
              <CardBody className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">
                    Tidak ada tugas tertunda saat ini.
                  </p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={
                            task.prioritas === "tinggi"
                              ? "danger"
                              : task.prioritas === "normal"
                              ? "info"
                              : "secondary"
                          }
                          size="sm"
                        >
                          {task.prioritas.toUpperCase()}
                        </Badge>
                        <span className="text-[11px] text-slate-400">
                          {formatDateShort(task.deadline)}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                        {task.judul}
                      </p>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
