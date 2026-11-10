"use client";

import { useState, useEffect } from "react";
import api from "../../../lib/api";
import DashboardLayout from "../../../components/DashboardLayout";
import Swal from "sweetalert2";
import StatCard from "@/components/ui/StatCard";
import Card, {
  CardBody,
  CardHeader,
  CardTitle,
  CardTools,
  CardFooter,
} from "@/components/ui/Card";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface TimMember {
  id: number;
  nama_lengkap: string;
  email: string;
  no_whatsapp: string;
  role: string;
  event_name: string;
  created_at: string;
}

interface Mahasiswa {
  id: number;
  nim: string;
  nama_lengkap: string;
  email: string;
  no_hp_mahasiswa: string;
}

interface EventOption {
  id: number;
  judul: string;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function KelolaTimPage() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [tim, setTim] = useState<TimMember[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(tim.length / itemsPerPage);
  const paginatedTim = tim.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Add member modal state
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Search Mahasiswa states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Mahasiswa[]>([]);
  const [searching, setSearching] = useState(false);

  // Add Member state
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<Mahasiswa | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [role, setRole] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      setUser(
        storedUser
          ? JSON.parse(storedUser)
          : { id: 2, name: "BEM El Rahma", email: "bem@elrahma.ac.id", role: "penyelenggara" }
      );
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resTim, resEvents] = await Promise.all([
        api.get('/tim'),
        api.get('/tim/events')
      ]);
      setTim(resTim.data);
      setEvents(resEvents.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // Debounce Search Mahasiswa
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setSearching(true);
        try {
          const res = await api.get(`/tim/search?q=${searchQuery}`);
          setSearchResults(res.data);
        } catch (error) {
          console.error(error);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectMahasiswa = (mhs: Mahasiswa) => {
    setSelectedMahasiswa(mhs);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleAddTim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMahasiswa) return;

    if (!selectedEventId || !role) {
      Swal.fire('Error', 'Silakan pilih event dan isi role panitia', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.post('/tim', {
        mahasiswa_id: selectedMahasiswa.id,
        workshop_id: selectedEventId,
        role: role
      });

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Anggota tim berhasil ditambahkan ke event.',
        timer: 2000,
        showConfirmButton: false
      });

      setSelectedMahasiswa(null);
      setSelectedEventId("");
      setRole("");
      setIsAddOpen(false);
      fetchData();
    } catch (err) {
      const apiErr = err as ApiErrorResponse;
      Swal.fire('Gagal!', apiErr.response?.data?.message || 'Terjadi kesalahan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    const result = await Swal.fire({
      title: 'Hapus Anggota?',
      html: `Hapus <strong>${nama}</strong> dari kepanitiaan event ini?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/tim/${id}`);
        Swal.fire('Terhapus!', 'Anggota tim berhasil dihapus.', 'success');
        fetchData();
      } catch (err) {
        const apiErr = err as ApiErrorResponse;
        Swal.fire('Gagal!', apiErr.response?.data?.message || 'Gagal menghapus data', 'error');
      }
    }
  };

  const columns: Column<TimMember>[] = [
    {
      key: "nama_lengkap",
      header: "Nama Panitia",
      width: "40%",
      render: (anggota) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold shrink-0">
            {anggota.nama_lengkap.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
              {anggota.nama_lengkap}
            </p>
            <span className="text-xs text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
              <i className="bi bi-telephone" aria-hidden="true" />
              {anggota.no_whatsapp || "-"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Peran & Event",
      render: (anggota) => (
        <div className="space-y-1">
          <Badge variant="primary" size="sm">
            {anggota.role}
          </Badge>
          <p
            className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate max-w-[220px]"
            title={anggota.event_name}
          >
            {anggota.event_name}
          </p>
        </div>
      ),
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "center",
      render: (anggota) => (
        <Button
          variant="danger"
          size="sm"
          icon="bi-trash"
          onClick={() => handleDelete(anggota.id, anggota.nama_lengkap)}
          aria-label={`Hapus ${anggota.nama_lengkap}`}
        />
      ),
    },
  ];

  const totalEvents = new Set(tim.map((t) => t.event_name)).size;
  const totalRoles = new Set(tim.map((t) => t.role)).size;

  if (loading) {
    return (
      <DashboardLayout
        user={user}
        title="Kelola Tim Panitia"
        subtitle="Atur siapa saja mahasiswa yang menjadi panitia pada setiap event."
        links={[]}
        onLogout={handleLogout}
      >
        <LoadingSkeleton variant="table" rows={5} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      user={user}
      title="Kelola Tim Panitia"
      subtitle="Atur siapa saja mahasiswa yang menjadi panitia pada setiap event."
      links={[]}
      onLogout={handleLogout}
    >
      <div className="space-y-6 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Panitia"
            value={tim.length}
            icon="bi-people"
            variant="primary"
          />
          <StatCard
            title="Event Terlibat"
            value={totalEvents}
            icon="bi-calendar-event"
            variant="info"
          />
          <StatCard
            title="Posisi Terdaftar"
            value={totalRoles}
            icon="bi-briefcase"
            variant="warning"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle icon="bi-people-fill">Daftar Kepanitiaan Event</CardTitle>
            <CardTools>
              <Button
                variant="primary"
                size="sm"
                icon="bi-plus-lg"
                onClick={() => setIsAddOpen(true)}
              >
                Tambah Panitia
              </Button>
            </CardTools>
          </CardHeader>

          <CardBody className="p-0">
            <DataTable
              columns={columns}
              data={paginatedTim}
              keyExtractor={(anggota) => anggota.id}
              emptyTitle="Belum ada data kepanitiaan"
              emptyMessage="Tambahkan mahasiswa sebagai panitia agar dapat mengelola event."
              emptyAction={
                <Button
                  variant="primary"
                  size="sm"
                  icon="bi-plus-lg"
                  onClick={() => setIsAddOpen(true)}
                >
                  Tambah Panitia
                </Button>
              }
              renderMobileCard={(anggota) => (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold shrink-0">
                        {anggota.nama_lengkap.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
                          {anggota.nama_lengkap}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {anggota.no_whatsapp || "-"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      icon="bi-trash"
                      onClick={() => handleDelete(anggota.id, anggota.nama_lengkap)}
                      aria-label={`Hapus ${anggota.nama_lengkap}`}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="primary" size="sm">
                      {anggota.role}
                    </Badge>
                    <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
                      {anggota.event_name}
                    </span>
                  </div>
                </div>
              )}
              className="rounded-none"
            />
          </CardBody>

          {totalPages > 1 && (
            <CardFooter className="block p-0">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={tim.length}
                onPageChange={setCurrentPage}
                className="border-t-0"
              />
            </CardFooter>
          )}
        </Card>
      </div>

      <Modal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Tambah Panitia"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              form="add-tim-form"
              icon="bi-shield-check"
              loading={saving}
              disabled={!selectedMahasiswa}
            >
              Jadikan Panitia
            </Button>
          </>
        }
      >
        <form id="add-tim-form" onSubmit={handleAddTim} className="space-y-5">
          {!selectedMahasiswa ? (
            <div className="space-y-3">
              <Input
                label="Cari Mahasiswa"
                icon="bi-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik NIM, nama, atau email..."
                helper="Minimal 3 karakter untuk mulai mencari."
              />

              {searching && (
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <i className="bi bi-arrow-repeat animate-spin" aria-hidden="true" />
                  Mencari mahasiswa...
                </p>
              )}

              {searchResults.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs max-h-60 overflow-y-auto">
                  {searchResults.map((mhs) => (
                    <button
                      key={mhs.id}
                      type="button"
                      onClick={() => handleSelectMahasiswa(mhs)}
                      className="w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors"
                    >
                      <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                        {mhs.nama_lengkap}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {mhs.nim || '-'} • {mhs.email}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 p-4 rounded-xl relative">
                <button
                  type="button"
                  onClick={() => setSelectedMahasiswa(null)}
                  className="absolute top-2 right-2 p-1 rounded-md text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200 transition"
                  aria-label="Batalkan pilihan mahasiswa"
                >
                  <i className="bi bi-x-lg" aria-hidden="true" />
                </button>
                <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest mb-1">
                  Mahasiswa Terpilih
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-100">
                  {selectedMahasiswa.nama_lengkap}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {selectedMahasiswa.email}
                </p>
              </div>

              <Select
                label="Pilih Event"
                required
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                placeholder="-- Pilih Event --"
                options={events.map((ev) => ({
                  value: ev.id.toString(),
                  label: ev.judul,
                }))}
              />

              <Input
                label="Posisi / Role Kepanitiaan"
                required
                icon="bi-person-badge"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Contoh: Ketua Pelaksana, Humas, dll"
              />
            </>
          )}
        </form>
      </Modal>
    </DashboardLayout>
  );
}
