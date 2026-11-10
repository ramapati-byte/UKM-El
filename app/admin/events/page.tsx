"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getBackendBaseUrl } from "@/lib/axios";
import api from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import Card, {
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  CardTools,
} from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Tabs from "@/components/ui/Tabs";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";

interface Event {
  id: number;
  judul: string;
  deskripsi: string;
  poster: string | null;
  tanggal_waktu: string;
  lokasi: string;
  visibilitas: "public" | "internal";
  tipe_event: "gratis" | "berbayar";
  harga: number;
  status: "draft" | "approved" | "rejected";
  ukm_penyelenggara: string | null;
  nama_penyelenggara: string | null;
  created_at: string;
}

interface UserData {
  user_id?: number;
  id?: number;
  name: string;
  email: string;
  role: string;
}

type ApiErr = { response?: { data?: { message?: string } } };

export default function ManageEventsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchEvents = async () => {
    try {
      setLoadingData(true);
      const res = await api.get("/events/manage?limit=1000");
      setEvents(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data event:", err);
      Swal.fire("Error", "Gagal memuat daftar event dari server.", "error");
    } finally {
      setLoadingData(false);
    }
  };

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
    fetchEvents();
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const handleApprove = async (id: number) => {
    setActionLoadingId(id);
    try {
      await api.patch(`/events/${id}/status`, { status: "approved" });
      Swal.fire({
        icon: "success",
        title: "Disetujui!",
        text: "Event berhasil disetujui dan telah dipublikasikan.",
        timer: 1500,
        showConfirmButton: false,
      });
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, status: "approved" as const } : e
        )
      );
    } catch (err) {
      console.error(err);
      const apiErr = err as ApiErr;
      Swal.fire(
        "Gagal",
        apiErr.response?.data?.message || "Gagal menyetujui event.",
        "error"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: number) => {
    const confirmReject = await Swal.fire({
      title: "Tolak Event ini?",
      text: "Event akan ditolak dan tidak akan ditampilkan pada katalog mahasiswa.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Tolak!",
      cancelButtonText: "Batal",
    });

    if (!confirmReject.isConfirmed) return;

    setActionLoadingId(id);
    try {
      await api.patch(`/events/${id}/status`, { status: "rejected" });
      Swal.fire({
        icon: "info",
        title: "Ditolak",
        text: "Status event telah diubah menjadi ditolak.",
        timer: 1500,
        showConfirmButton: false,
      });
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, status: "rejected" as const } : e
        )
      );
    } catch (err) {
      console.error(err);
      const apiErr = err as ApiErr;
      Swal.fire(
        "Gagal",
        apiErr.response?.data?.message || "Gagal menolak event.",
        "error"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = await Swal.fire({
      title: "Hapus Event Permanen?",
      text: "Tindakan ini tidak dapat dibatalkan! Semua data pendaftaran terkait juga akan terhapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (confirmDelete.isConfirmed) {
      try {
        await api.delete(`/events/${id}`);
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Event berhasil dihapus dari sistem.",
          timer: 1500,
          showConfirmButton: false,
        });
        setEvents((prev) => prev.filter((e) => e.id !== id));
      } catch (err) {
        console.error(err);
        const apiErr = err as ApiErr;
        Swal.fire(
          "Gagal",
          apiErr.response?.data?.message || "Gagal menghapus event.",
          "error"
        );
      }
    }
  };

  const formatTanggal = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatJam = (dateString: string) => {
    const d = new Date(dateString);
    return (
      d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB"
    );
  };

  const searchedEvents = events.filter((e) => {
    const query = searchQuery.toLowerCase();
    return (
      e.judul.toLowerCase().includes(query) ||
      (e.lokasi && e.lokasi.toLowerCase().includes(query)) ||
      (e.ukm_penyelenggara &&
        e.ukm_penyelenggara.toLowerCase().includes(query)) ||
      (e.nama_penyelenggara &&
        e.nama_penyelenggara.toLowerCase().includes(query))
    );
  });

  const pendingEvents = searchedEvents.filter((e) => e.status === "draft");
  const displayEvents =
    activeTab === "pending" ? pendingEvents : searchedEvents;

  const totalPages = Math.ceil(displayEvents.length / itemsPerPage);
  const paginatedEvents = displayEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<Event>[] = [
    {
      key: "event",
      header: "Event",
      width: "28%",
      render: (event) => (
        <div className="flex items-center gap-3">
          <div className="h-12 w-20 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
            {event.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${getBackendBaseUrl()}/uploads/${event.poster}`}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <i
                className="bi bi-calendar-event text-slate-400 text-lg"
                aria-hidden="true"
              />
            )}
          </div>
          <div className="min-w-0">
            <h4
              className="font-semibold text-slate-800 dark:text-slate-100 max-w-xs truncate"
              title={event.judul}
            >
              {event.judul}
            </h4>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
              Dibuat: {new Date(event.created_at).toLocaleDateString("id-ID")}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "penyelenggara",
      header: "Penyelenggara / UKM",
      render: (event) => (
        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          <i
            className="bi bi-building text-slate-400 shrink-0"
            aria-hidden="true"
          />
          <span>
            {event.ukm_penyelenggara ||
              event.nama_penyelenggara ||
              "BEM / UKM Kampus"}
          </span>
        </div>
      ),
    },
    {
      key: "waktu",
      header: "Waktu & Tempat",
      render: (event) => (
        <div className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <i
              className="bi bi-calendar-event text-sky-500 shrink-0"
              aria-hidden="true"
            />
            {formatTanggal(event.tanggal_waktu)} ({formatJam(event.tanggal_waktu)})
          </span>
          <span className="flex items-center gap-1.5">
            <i
              className="bi bi-geo-alt text-indigo-500 shrink-0"
              aria-hidden="true"
            />
            <span className="truncate max-w-[150px]" title={event.lokasi}>
              {event.lokasi}
            </span>
          </span>
        </div>
      ),
    },
    {
      key: "visibilitas",
      header: "Visibilitas",
      align: "center",
      render: (event) => (
        <Badge
          variant={event.visibilitas === "public" ? "info" : "secondary"}
          size="sm"
        >
          <i
            className={`bi ${
              event.visibilitas === "public" ? "bi-globe" : "bi-lock"
            }`}
            aria-hidden="true"
          />
          {event.visibilitas === "public" ? "Public" : "Internal"}
        </Badge>
      ),
    },
    {
      key: "harga",
      header: "Biaya Masuk",
      align: "center",
      render: (event) => {
        const isFree = event.tipe_event === "gratis" || event.harga <= 0;
        return (
          <Badge variant={isFree ? "success" : "primary"} size="sm">
            {isFree
              ? "GRATIS"
              : `Rp ${Number(event.harga).toLocaleString("id-ID")}`}
          </Badge>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (event) => {
        const variant =
          event.status === "approved"
            ? "success"
            : event.status === "rejected"
            ? "danger"
            : "warning";
        const label =
          event.status === "approved"
            ? "Disetujui"
            : event.status === "rejected"
            ? "Ditolak"
            : "Draft";
        return (
          <Badge variant={variant} size="sm" dot>
            {label}
          </Badge>
        );
      },
    },
    {
      key: "aksi",
      header: "Kontrol Aksi",
      align: "center",
      render: (event) => (
        <div className="flex items-center justify-center gap-2">
          {event.status === "draft" ? (
            <>
              <Button
                variant="primary"
                size="sm"
                icon="bi-check-lg"
                loading={actionLoadingId === event.id}
                disabled={actionLoadingId === event.id}
                onClick={() => handleApprove(event.id)}
                title="Setujui Event"
              >
                Setujui
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon="bi-x-lg"
                disabled={actionLoadingId === event.id}
                onClick={() => handleReject(event.id)}
                title="Tolak Event"
                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/60 dark:hover:bg-red-950/40"
              >
                Tolak
              </Button>
            </>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Telah Ditinjau
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            icon="bi-trash"
            onClick={() => handleDelete(event.id)}
            title="Hapus Event"
            aria-label="Hapus Event"
            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          />
        </div>
      ),
    },
  ];

  const tabs = [
    {
      id: "pending",
      label: "Menunggu Persetujuan",
      icon: "bi-shield-check",
      count: events.filter((e) => e.status === "draft").length,
    },
    {
      id: "all",
      label: "Semua Daftar Event",
      icon: "bi-calendar-event",
      count: events.length,
    },
  ];

  return (
    <DashboardLayout
      user={user}
      title="Kelola & Persetujuan Event"
      subtitle="Tinjau event berstatus draft atau kelola seluruh data event di platform."
      links={[]}
      onLogout={handleLogout}
    >
      <div className="space-y-6 pb-10">
        <Card>
          <CardHeader className="flex-col sm:flex-row sm:items-center">
            <CardTitle icon="bi-calendar-check">
              Manajemen & Verifikasi Event
            </CardTitle>
            <CardTools className="w-full sm:w-auto">
              <div className="w-full sm:w-80">
                <Input
                  icon="bi-search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari judul, penyelenggara, atau lokasi..."
                />
              </div>
            </CardTools>
          </CardHeader>

          <div className="px-5 pt-3">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={(id) => {
                setActiveTab(id as "pending" | "all");
                setCurrentPage(1);
              }}
            />
          </div>

          <CardBody className="p-0">
            <DataTable
              columns={columns}
              data={paginatedEvents}
              keyExtractor={(event) => event.id}
              loading={loadingData}
              emptyTitle={
                activeTab === "pending"
                  ? "Tidak Ada Event Menunggu"
                  : "Tidak Ada Event"
              }
              emptyMessage={
                activeTab === "pending"
                  ? "Semua event baru sudah disetujui! Tidak ada proposal pending saat ini."
                  : "Belum ada data event terdaftar di dalam sistem."
              }
              className="rounded-none"
            />
          </CardBody>

          {totalPages > 1 && (
            <CardFooter className="block p-0">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={displayEvents.length}
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
