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
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";

interface Mahasiswa {
  id: number;
  google_id: string | null;
  nim: string | null;
  nama_lengkap: string;
  email: string;
  jenis_kelamin: "Laki-laki" | "Perempuan" | null;
  prodi: string | null;
  no_hp_mahasiswa: string | null;
  foto_mahasiswa: string | null;
  status: "active" | "inactive";
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

const GENDER_OPTIONS = [
  { value: "Laki-laki", label: "Laki-laki" },
  { value: "Perempuan", label: "Perempuan" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Aktif (Dapat Login & Daftar Event)" },
  { value: "inactive", label: "Dinonaktifkan (Blokir Akses Login)" },
];

export default function ManageMahasiswaPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [mahasiswas, setMahasiswas] = useState<Mahasiswa[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nim: "",
    nama_lengkap: "",
    email: "",
    password: "",
    jenis_kelamin: "Laki-laki",
    prodi: "",
    no_hp_mahasiswa: "",
    status: "active",
  });

  const [formLoading, setFormLoading] = useState(false);

  const fetchMahasiswa = async () => {
    try {
      setLoadingData(true);
      const res = await api.get("/admin/mahasiswa");
      setMahasiswas(res.data);
    } catch (err) {
      console.error("Gagal memuat data mahasiswa:", err);
      Swal.fire("Error", "Gagal mengambil data mahasiswa dari server.", "error");
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
    fetchMahasiswa();
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      nim: "",
      nama_lengkap: "",
      email: "",
      password: "",
      jenis_kelamin: "Laki-laki",
      prodi: "",
      no_hp_mahasiswa: "",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (mhs: Mahasiswa) => {
    setIsEditing(true);
    setEditingId(mhs.id);
    setFormData({
      nim: mhs.nim || "",
      nama_lengkap: mhs.nama_lengkap,
      email: mhs.email,
      password: "",
      jenis_kelamin: mhs.jenis_kelamin || "Laki-laki",
      prodi: mhs.prodi || "",
      no_hp_mahasiswa: mhs.no_hp_mahasiswa || "",
      status: mhs.status,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (isEditing && editingId) {
        await api.put(`/admin/mahasiswa/${editingId}`, formData);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data mahasiswa berhasil diperbarui.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await api.post("/admin/mahasiswa", formData);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Mahasiswa berhasil ditambahkan.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      setIsModalOpen(false);
      fetchMahasiswa();
    } catch (err) {
      console.error(err);
      const apiErr = err as ApiErr;
      Swal.fire(
        "Gagal",
        apiErr.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan data.",
        "error"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Seluruh data pendaftaran dan keikutsertaan event mahasiswa ini akan ikut terhapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/mahasiswa/${id}`);
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Mahasiswa telah berhasil dihapus.",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchMahasiswa();
      } catch (err) {
        console.error(err);
        const apiErr = err as ApiErr;
        Swal.fire(
          "Gagal",
          apiErr.response?.data?.message || "Gagal menghapus mahasiswa.",
          "error"
        );
      }
    }
  };

  const handleToggleStatus = async (
    id: number,
    currentStatus: "active" | "inactive"
  ) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      await api.patch(`/admin/mahasiswa/${id}/status`, { status: newStatus });
      Swal.fire({
        icon: "success",
        title: "Status Diperbarui!",
        text: `Akun mahasiswa telah ${
          newStatus === "active" ? "diaktifkan" : "dinonaktifkan"
        }.`,
        timer: 1500,
        showConfirmButton: false,
      });
      setMahasiswas((prev) =>
        prev.map((mhs) => (mhs.id === id ? { ...mhs, status: newStatus } : mhs))
      );
    } catch (err) {
      console.error(err);
      const apiErr = err as ApiErr;
      Swal.fire(
        "Gagal",
        apiErr.response?.data?.message || "Gagal memperbarui status akun.",
        "error"
      );
    }
  };

  const filteredMahasiswas = mahasiswas.filter((m) => {
    const query = searchQuery.toLowerCase();
    return (
      m.nama_lengkap.toLowerCase().includes(query) ||
      (m.nim && m.nim.toLowerCase().includes(query)) ||
      m.email.toLowerCase().includes(query) ||
      (m.prodi && m.prodi.toLowerCase().includes(query))
    );
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(filteredMahasiswas.length / itemsPerPage);
  const paginatedMahasiswas = filteredMahasiswas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<Mahasiswa>[] = [
    {
      key: "mahasiswa",
      header: "Mahasiswa",
      render: (mhs) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 overflow-hidden shrink-0 text-sm uppercase">
            {mhs.foto_mahasiswa ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={
                  mhs.foto_mahasiswa.startsWith("http")
                    ? mhs.foto_mahasiswa
                    : `${getBackendBaseUrl()}/uploads/${mhs.foto_mahasiswa}`
                }
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              mhs.nama_lengkap.slice(0, 2)
            )}
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-100">
              {mhs.nama_lengkap}
            </h4>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
              {mhs.jenis_kelamin || "Jenis Kelamin -"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "akademik",
      header: "Informasi Akademik",
      render: (mhs) => (
        <div className="flex flex-col gap-1 text-xs">
          <Badge variant="secondary" size="sm">
            {mhs.nim || "NIM - (Belum Diisi)"}
          </Badge>
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <i
              className="bi bi-book text-indigo-500"
              aria-hidden="true"
            />
            {mhs.prodi || "Program Studi -"}
          </span>
        </div>
      ),
    },
    {
      key: "kontak",
      header: "Kontak",
      render: (mhs) => (
        <div className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <i
              className="bi bi-envelope text-slate-400 shrink-0"
              aria-hidden="true"
            />
            {mhs.email}
          </span>
          <span className="flex items-center gap-1.5">
            <i
              className="bi bi-telephone text-slate-400 shrink-0"
              aria-hidden="true"
            />
            {mhs.no_hp_mahasiswa || "-"}
          </span>
        </div>
      ),
    },
    {
      key: "metode",
      header: "Metode Daftar",
      align: "center",
      render: (mhs) =>
        mhs.google_id ? (
          <Badge variant="danger" size="sm">
            Google OAuth
          </Badge>
        ) : (
          <Badge variant="primary" size="sm">
            Lokal Email
          </Badge>
        ),
    },
    {
      key: "status",
      header: "Status Akun",
      align: "center",
      render: (mhs) => (
        <Button
          variant="outline"
          size="sm"
          icon={mhs.status === "active" ? "bi-person-check" : "bi-person-x"}
          onClick={() => handleToggleStatus(mhs.id, mhs.status)}
          className={
            mhs.status === "active"
              ? "text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-300 dark:border-emerald-900/60 dark:hover:bg-emerald-950/40"
              : "text-red-700 border-red-200 hover:bg-red-50 dark:text-red-300 dark:border-red-900/60 dark:hover:bg-red-950/40"
          }
        >
          {mhs.status === "active" ? "Aktif" : "Dinonaktifkan"}
        </Button>
      ),
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "center",
      render: (mhs) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon="bi-pencil-square"
            onClick={() => handleOpenEditModal(mhs)}
            title="Edit Data"
            aria-label="Edit Data"
            className="text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
          />
          <Button
            variant="ghost"
            size="sm"
            icon="bi-trash"
            onClick={() => handleDelete(mhs.id)}
            title="Hapus Mahasiswa"
            aria-label="Hapus Mahasiswa"
            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          />
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      user={user}
      title="Manajemen Mahasiswa"
      subtitle="Kelola data pendaftaran mahasiswa dan atur status aktif akun mereka."
      links={[]}
      onLogout={handleLogout}
    >
      <div className="space-y-6 pb-10">
        <Card>
          <CardHeader className="flex-col sm:flex-row sm:items-center">
            <CardTitle icon="bi-mortarboard">
              Manajemen Akun Mahasiswa
            </CardTitle>
            <CardTools className="w-full sm:w-auto">
              <div className="w-full sm:w-72">
                <Input
                  icon="bi-search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari nama, NIM, email, atau prodi..."
                />
              </div>
              <Button
                variant="primary"
                icon="bi-plus-lg"
                onClick={handleOpenCreateModal}
                className="shrink-0"
              >
                Tambah Mahasiswa
              </Button>
            </CardTools>
          </CardHeader>

          <CardBody className="p-0">
            <DataTable
              columns={columns}
              data={paginatedMahasiswas}
              keyExtractor={(mhs) => mhs.id}
              loading={loadingData}
              emptyTitle="Tidak Ada Mahasiswa"
              emptyMessage="Belum ada data mahasiswa yang terdaftar di dalam sistem."
              emptyAction={
                <Button
                  variant="primary"
                  icon="bi-plus-lg"
                  onClick={handleOpenCreateModal}
                >
                  Tambah Mahasiswa
                </Button>
              }
              className="rounded-none"
            />
          </CardBody>

          {totalPages > 1 && (
            <CardFooter className="block p-0">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={filteredMahasiswas.length}
                onPageChange={setCurrentPage}
                className="border-t-0"
              />
            </CardFooter>
          )}
        </Card>
      </div>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={isEditing ? "Edit Data Mahasiswa" : "Tambah Mahasiswa Baru"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button
              type="submit"
              form="mahasiswa-form"
              variant="primary"
              loading={formLoading}
              icon="bi-save"
            >
              {isEditing ? "Simpan Perubahan" : "Tambah Mahasiswa"}
            </Button>
          </>
        }
      >
        <form id="mahasiswa-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="NIM (Nomor Induk Mahasiswa)"
              name="nim"
              value={formData.nim}
              onChange={handleInputChange}
              placeholder="Contoh: NIM2026001"
              icon="bi-hash"
            />
            <Input
              label="Nama Lengkap"
              name="nama_lengkap"
              required
              value={formData.nama_lengkap}
              onChange={handleInputChange}
              placeholder="Nama Lengkap Mahasiswa"
              icon="bi-person"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Aktif"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="mahasiswa@kampus.ac.id"
              icon="bi-envelope"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              required={!isEditing}
              value={formData.password}
              onChange={handleInputChange}
              placeholder={isEditing ? "••••••••" : "Password akun baru"}
              helper={isEditing ? "Kosongkan jika tidak ingin diubah" : undefined}
              icon="bi-key"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Program Studi"
              name="prodi"
              value={formData.prodi}
              onChange={handleInputChange}
              placeholder="Contoh: Teknik Informatika"
              icon="bi-book"
            />
            <Input
              label="No. WhatsApp / HP"
              name="no_hp_mahasiswa"
              value={formData.no_hp_mahasiswa}
              onChange={handleInputChange}
              placeholder="Contoh: 0812XXXXXXXX"
              icon="bi-telephone"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Jenis Kelamin"
              name="jenis_kelamin"
              value={formData.jenis_kelamin}
              onChange={handleInputChange}
              options={GENDER_OPTIONS}
            />
            <Select
              label="Status Akun"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={STATUS_OPTIONS}
            />
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
