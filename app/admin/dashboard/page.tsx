"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import StatCard from "@/components/ui/StatCard";
import Callout from "@/components/ui/Callout";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

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
      const res = await api.get("/admin/dashboard/stats");
      setStats(res.data.stats);
    } catch (err) {
      console.error("Gagal memuat stats:", err);
    } finally {
      setIsLoading(false);
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
        {isLoading ? (
          <LoadingSkeleton variant="card" count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Mahasiswa Aktif"
              value={stats?.active_students ?? 0}
              icon="bi-people"
              variant="primary"
              subtitle="Total akun aktif"
            />
            <StatCard
              title="Organisasi UKM"
              value={stats?.active_organizers ?? 0}
              icon="bi-building"
              variant="info"
              subtitle="Akun penyelenggara"
            />
            <StatCard
              title="Event Publikasi"
              value={stats?.published_events ?? 0}
              icon="bi-check-circle"
              variant="success"
              subtitle="Telah disetujui"
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
            Ada <b>{pendingEvents}</b> event yang menunggu persetujuan.{" "}
            <Link
              href="/admin/events"
              className="font-semibold underline underline-offset-2"
            >
              Tinjau sekarang
            </Link>
          </Callout>
        )}
      </div>
    </DashboardLayout>
  );
}
