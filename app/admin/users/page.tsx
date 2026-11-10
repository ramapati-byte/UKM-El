"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
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

interface User {
  id: number;
  nama_lengkap: string;
  email: string;
  no_whatsapp: string | null;
  jenis_kelamin: "Laki-laki" | "Perempuan" | null;
  role: "superadmin" | "penyelenggara" | "peserta";
  status: "active" | "inactive";
  ukm: string | null;
  created_at: string;
}

interface UserData {
  id?: number;
  user_id?: number;
  name: string;
  email: string;
  role: string;
}

type ApiErr = { response?: { data?: { message?: string } } };

const ROLE_OPTIONS = [
  { value: "penyelenggara", label: "Penyelenggara (UKM / Organisasi)" },
  { value: "superadmin", label: "Superadmin (Pengelola Sistem)" },
];

const GENDER_OPTIONS = [
  { value: "Laki-laki", label: "Laki-laki" },
  { value: "Perempuan", label: "Perempuan" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Dinonaktifkan" },
];

export default function ManageUsersPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nama_lengkap: "",
    email: "",
    no_whatsapp: "",
    jenis_kelamin: "Laki-laki",
    role: "penyelenggara",
    status: "active",
    password: "",
    ukm: "",
  });

  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoadingData(true);
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Gagal memuat data user:", err);
      Swal.fire("Error", "Gagal mengambil data user dari server.", "error");
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
    fetchUsers();
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
      nama_lengkap: "",
      email: "",
      no_whatsapp: "",
      jenis_kelamin: "Laki-laki",
      role: "penyelenggara",
      status: "active",
      password: "",
      ukm: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setIsEditing(true);
    setEditingId(u.id);
    setFormData({
      nama_lengkap: u.nama_lengkap,
      email: u.email,
      no_whatsapp: u.no_whatsapp || "",
      jenis_kelamin: u.jenis_kelamin || "Laki-laki",
      role: u.role,
      status: u.status,
      password: "",
      ukm: u.ukm || "",
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
        await api.put(`/admin/users/${editingId}`, formData);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data user berhasil diperbarui.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await api.post("/admin/users", formData);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "User berhasil ditambahkan.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      setIsModalOpen(false);
      fetchUsers();
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
    if (user && id === user.id) {
      Swal.fire(
        "Peringatan",
        "Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan!",
        "warning"
      );
      return;
    }

    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "User yang dihapus tidak akan dapat mengakses dashboard ini lagi!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/users/${id}`);
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "User telah berhasil dihapus.",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchUsers();
      } catch (err) {
        console.error(err);
        const apiErr = err as ApiErr;
        Swal.fire(
          "Gagal",
          apiErr.response?.data?.message || "Gagal menghapus user.",
          "error"
        );
      }
    }
  };

  const handleToggleStatus = async (
    id: number,
    currentStatus: "active" | "inactive"
  ) => {
    if (user && id === user.id && currentStatus === "active") {
      Swal.fire(
        "Peringatan",
        "Anda tidak dapat menonaktifkan akun Anda sendiri!",
        "warning"
      );
      return;
    }

    const newStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      await api.patch(`/admin/users/${id}/status`, { status: newStatus });
      Swal.fire({
        icon: "success",
        title: "Status Diperbarui!",
        text: `Akun user telah ${
          newStatus === "active" ? "diaktifkan" : "dinonaktifkan"
        }.`,
        timer: 1500,
        showConfirmButton: false,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
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

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      u.nama_lengkap.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query) ||
      (u.ukm && u.ukm.toLowerCase().includes(query))
    );
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<User>[] = [
    {
      key: "user",
      header: "User",
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 overflow-hidden shrink-0 text-sm uppercase">
            {u.nama_lengkap.slice(0, 2)}
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-100">
              {u.nama_lengkap}
            </h4>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
              {u.jenis_kelamin || "Jenis Kelamin -"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "ukm",
      header: "Organisasi / UKM",
      render: (u) => (
        <div className="flex items-center gap-2">
          <i
            className="bi bi-building text-slate-400 shrink-0"
            aria-hidden="true"
          />
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {u.ukm || "Superadmin Team"}
          </span>
        </div>
      ),
    },
    {
      key: "kontak",
      header: "Kontak WhatsApp",
      render: (u) => (
        <div className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <i
              className="bi bi-envelope text-slate-400 shrink-0"
              aria-hidden="true"
            />
            {u.email}
          </span>
          <span className="flex items-center gap-1.5">
            <i
              className="bi bi-telephone text-slate-400 shrink-0"
              aria-hidden="true"
            />
            {u.no_whatsapp || "-"}
          </span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Peran (Role)",
      align: "center",
      render: (u) =>
        u.role === "superadmin" ? (
          <Badge variant="danger" size="sm">
            <i className="bi bi-shield-check" aria-hidden="true" />
            Superadmin
          </Badge>
        ) : (
          <Badge variant="warning" size="sm">
            <i className="bi bi-building" aria-hidden="true" />
            Penyelenggara
          </Badge>
        ),
    },
    {
      key: "status",
      header: "Status Akun",
      align: "center",
      render: (u) => (
        <Button
          variant="outline"
          size="sm"
          icon={u.status === "active" ? "bi-person-check" : "bi-person-x"}
          onClick={() => handleToggleStatus(u.id, u.status)}
          className={
            u.status === "active"
              ? "text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-300 dark:border-emerald-900/60 dark:hover:bg-emerald-950/40"
              : "text-red-700 border-red-200 hover:bg-red-50 dark:text-red-300 dark:border-red-900/60 dark:hover:bg-red-950/40"
          }
        >
          {u.status === "active" ? "Aktif" : "Dinonaktifkan"}
        </Button>
      ),
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "center",
      render: (u) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon="bi-pencil-square"
            onClick={() => handleOpenEditModal(u)}
            title="Edit User"
            aria-label="Edit User"
            className="text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
          />
          <Button
            variant="ghost"
            size="sm"
            icon="bi-trash"
            onClick={() => handleDelete(u.id)}
            disabled={!!(user && u.id === user.id)}
            title="Hapus User"
            aria-label="Hapus User"
            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          />
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      user={user}
      title="Manajemen User"
      subtitle="Kelola akun Penyelenggara Event (UKM) dan Superadmin."
      links={[]}
      onLogout={handleLogout}
    >
      <div className="space-y-6 pb-10">
        <Card>
          <CardHeader className="flex-col sm:flex-row sm:items-center">
            <CardTitle icon="bi-people">Manajemen Akun Internal</CardTitle>
            <CardTools className="w-full sm:w-auto">
              <div className="w-full sm:w-72">
                <Input
                  icon="bi-search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari nama, email, UKM, atau role..."
                />
              </div>
              <Button
                variant="primary"
                icon="bi-plus-lg"
                onClick={handleOpenCreateModal}
                className="shrink-0"
              >
                Tambah User
              </Button>
            </CardTools>
          </CardHeader>

          <CardBody className="p-0">
            <DataTable
              columns={columns}
              data={paginatedUsers}
              keyExtractor={(u) => u.id}
              loading={loadingData}
              emptyTitle="Tidak Ada User"
              emptyMessage="Belum ada data user yang terdaftar di dalam sistem."
              emptyAction={
                <Button variant="primary" icon="bi-plus-lg" onClick={handleOpenCreateModal}>
                  Tambah User Baru
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
                totalRecords={filteredUsers.length}
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
        title={isEditing ? "Edit Data User" : "Tambah User Baru"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button
              type="submit"
              form="user-form"
              variant="primary"
              loading={formLoading}
              icon="bi-save"
            >
              {isEditing ? "Simpan Perubahan" : "Tambah User"}
            </Button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap"
              name="nama_lengkap"
              required
              value={formData.nama_lengkap}
              onChange={handleInputChange}
              placeholder="Nama Lengkap User"
              icon="bi-person"
            />
            <Input
              label="Email Aktif"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="user@gmail.com"
              icon="bi-envelope"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nomor WhatsApp"
              name="no_whatsapp"
              value={formData.no_whatsapp}
              onChange={handleInputChange}
              placeholder="Contoh: 0812XXXXXXXX"
              icon="bi-telephone"
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
            <Select
              label="Peran (Role)"
              name="role"
              required
              value={formData.role}
              onChange={handleInputChange}
              options={ROLE_OPTIONS}
            />
            <Input
              label="Nama UKM / Organisasi"
              name="ukm"
              value={formData.ukm}
              disabled={formData.role !== "penyelenggara"}
              onChange={handleInputChange}
              placeholder={
                formData.role !== "penyelenggara"
                  ? "Hanya untuk peran Penyelenggara"
                  : "Contoh: BEM Teknik / UKM Musik"
              }
              icon="bi-building"
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
