"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import StatCard from "@/components/ui/StatCard";
import Callout from "@/components/ui/Callout";
import Button from "@/components/ui/Button";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import Card, { CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { dashboardService } from "@/services/dashboard.service";
import { ukmService } from "@/services/ukm.service";
import type { UkmStats } from "@/types/ukm";

interface UserData {
  user_id?: number;
  id?: number;
  name: string;
  email: string;
  role: string;
}

interface AdminStats {
  active_students?: number;
  active_organizers?: number;
  published_events?: number;
  pending_events?: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [ukmStats, setUkmStats] = useState<UkmStats | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const storedUser =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    setUser(
      storedUser
        ? JSON.parse(storedUser)
        : {
            id: 1,
            name: "Super Admin",
            nama_lengkap: "Super Admin",
            email: "superadmin@elrahma.ac.id",
            role: "superadmin",
          }
    );
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const [resStats, uStats] = await Promise.all([
        api.get("/admin/dashboard/stats"),
        ukmService.stats(),
      ]);
      setStats(resStats.data.stats);
      setUkmStats(uStats);
    } catch (err) {
      console.error("Gagal memuat stats:", err);
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
      a.download = "laporan-eksekutif-kampus.pdf";
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
      a.download = "data-agregat-kampus.xlsx";
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

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const pendingEvents = stats?.pending_events ?? 0;

  return (
    <DashboardLayout
      user={user}
      title="Dashboard Superadmin"
      subtitle={`Selamat bertugas, ${user?.name ?? "Administrator"}.`}
      links={[]}
      onLogout={handleLogout}
    >
      <div className="space-y-6 pb-10">
        {/* Export Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Rekap Pelaporan Eksekutif
            </h2>
            <p className="text-xs text-slate-500">
              Unduh kompilasi statistik keaktifan dan pelaporan kegiatan seluruh UKM
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

        {isLoading ? (
          <LoadingSkeleton variant="card" count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Mahasiswa Aktif"
              value={stats?.active_students ?? 0}
              icon="bi-people"
              variant="primary"
              subtitle="Total akun aktif kampus"
            />
            <StatCard
              title="Organisasi UKM"
              value={ukmStats?.total ?? stats?.active_organizers ?? 0}
              icon="bi-building"
              variant="info"
              subtitle={`${ukmStats?.verified ?? 0} UKM terverifikasi`}
            />
            <StatCard
              title="Event Publikasi"
              value={stats?.published_events ?? 0}
              icon="bi-check-circle"
              variant="success"
              subtitle="Telah disetujui pusat"
            />
            <StatCard
              title="Menunggu Persetujuan"
              value={pendingEvents}
              icon="bi-clock-history"
              variant="warning"
              subtitle="Event draft/pengajuan"
            />
          </div>
        )}

        {!isLoading && pendingEvents > 0 && (
          <Callout variant="warning" title="Perlu Persetujuan">
            Ada <b>{pendingEvents}</b> event yang menunggu persetujuan pusat.{" "}
            <Link
              href="/admin/events"
              className="font-semibold underline underline-offset-2"
            >
              Tinjau sekarang
            </Link>
          </Callout>
        )}

        {/* Ringkasan Status UKM & Kinerja */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Status Verifikasi UKM</CardTitle>
              <Link
                href="/admin/ukm"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Kelola Semua <i className="bi bi-arrow-right" aria-hidden="true" />
              </Link>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  UKM Terverifikasi
                </span>
                <Badge variant="success">{ukmStats?.verified ?? 0}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                  Menunggu Verifikasi Legalitas
                </span>
                <Badge variant="warning">{ukmStats?.pending ?? 0}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  UKM Nonaktif / Ditolak
                </span>
                <Badge variant="secondary">
                  {(ukmStats?.rejected ?? 0) + (ukmStats?.inactive ?? 0)}
                </Badge>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Menu Pengawasan Pusat</CardTitle>
            </CardHeader>
            <CardBody className="grid grid-cols-2 gap-3">
              <Link
                href="/admin/events"
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex flex-col items-center text-center space-y-1"
              >
                <i className="bi bi-calendar-check text-2xl text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                  Approval Event
                </span>
                <span className="text-[10px] text-slate-500">Tinjau proposal</span>
              </Link>
              <Link
                href="/admin/ranking"
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex flex-col items-center text-center space-y-1"
              >
                <i className="bi bi-trophy text-2xl text-amber-500" aria-hidden="true" />
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                  Peringkat Kinerja
                </span>
                <span className="text-[10px] text-slate-500">Evaluasi UKM</span>
              </Link>
              <Link
                href="/admin/roles"
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex flex-col items-center text-center space-y-1"
              >
                <i className="bi bi-shield-check text-2xl text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                  Role & Akses
                </span>
                <span className="text-[10px] text-slate-500">Matriks otorisasi</span>
              </Link>
              <Link
                href="/admin/audit"
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex flex-col items-center text-center space-y-1"
              >
                <i className="bi bi-journal-text text-2xl text-sky-600 dark:text-sky-400" aria-hidden="true" />
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                  Audit Trail
                </span>
                <span className="text-[10px] text-slate-500">Log aktivitas sistem</span>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
