"use client";

import { getBackendBaseUrl } from "@/lib/axios";
import { useEffect, useState, useRef } from "react";
import MahasiswaLayout from "../../../components/MahasiswaLayout";
import api from "../../../lib/api";
import Swal from "sweetalert2";
import Card, { CardBody, CardFooter, CardHeader, CardTitle } from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import LoadingSkeleton from "../../../components/ui/LoadingSkeleton";

export default function ProfilPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    nama_lengkap: "",
    nim: "",
    no_hp_mahasiswa: "",
    jenis_kelamin: "",
    prodi: "",
    password_baru: "",
    konfirmasi_password: "",
  });
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/mahasiswa/profil");
        setProfile(res.data);
        setForm({
          nama_lengkap: res.data.nama_lengkap || "",
          nim: res.data.nim || "",
          no_hp_mahasiswa: res.data.no_hp_mahasiswa || "",
          jenis_kelamin: res.data.jenis_kelamin || "",
          prodi: res.data.prodi || "",
          password_baru: "",
          konfirmasi_password: "",
        });
        if (res.data.foto_mahasiswa) {
          setFotoPreview(`${getBackendBaseUrl()}/uploads/${res.data.foto_mahasiswa}`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_lengkap.trim()) {
      Swal.fire("Error", "Nama lengkap wajib diisi", "error");
      return;
    }
    if (form.password_baru && form.password_baru !== form.konfirmasi_password) {
      Swal.fire("Error", "Konfirmasi password tidak cocok", "error");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("nama_lengkap", form.nama_lengkap);
      fd.append("nim", form.nim);
      fd.append("no_hp_mahasiswa", form.no_hp_mahasiswa);
      fd.append("jenis_kelamin", form.jenis_kelamin);
      fd.append("prodi", form.prodi);
      if (form.password_baru) {
        fd.append("password_baru", form.password_baru);
        fd.append("konfirmasi_password", form.konfirmasi_password);
      }
      if (fotoFile) fd.append("foto_mahasiswa", fotoFile);

      const token = localStorage.getItem("token");
      const response = await fetch(`${getBackendBaseUrl()}/api/mahasiswa/profil`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || "Gagal memperbarui profil");

      const newFoto = resData.foto_mahasiswa;
      setProfile((prev: any) => ({
        ...prev,
        nim: form.nim,
        nama_lengkap: form.nama_lengkap,
        foto_mahasiswa: newFoto,
      }));
      const stored = localStorage.getItem("user");
      if (stored) {
        const user = JSON.parse(stored);
        user.name = form.nama_lengkap;
        user.nim = form.nim;
        if (newFoto) {
          user.foto_mahasiswa = newFoto;
        }
        localStorage.setItem("user", JSON.stringify(user));
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Profil berhasil diperbarui.",
        timer: 1500,
        showConfirmButton: false,
      });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal memperbarui profil", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MahasiswaLayout>
        <div className="space-y-6 pb-10">
          <LoadingSkeleton variant="card" count={2} />
        </div>
      </MahasiswaLayout>
    );
  }

  return (
    <MahasiswaLayout>
      <div className="space-y-6 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <Card>
            <CardBody className="text-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 mx-auto bg-white dark:bg-slate-900 p-1 rounded-full shadow-sm group relative cursor-pointer hover:ring-4 hover:ring-indigo-100 dark:hover:ring-indigo-950 transition-all duration-300"
                title="Klik untuk mengubah foto profil"
              >
                {fotoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={fotoPreview}
                    alt="Foto profil"
                    className="w-full h-full rounded-full object-cover border-2 border-slate-100 dark:border-slate-800"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center">
                    <i className="bi bi-person text-5xl text-indigo-400" aria-hidden="true" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 bg-amber-500 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm group-hover:scale-110 transition-transform">
                  <i className="bi bi-camera text-white text-sm" aria-hidden="true" />
                </div>
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-100">
                {profile?.nama_lengkap}
              </h2>
              <div className="mt-2">
                <Badge variant="primary">Mahasiswa</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                NIM: {profile?.nim || "-"}
              </p>

              <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-2 text-left text-xs">
                <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <i className="bi bi-envelope text-slate-400" aria-hidden="true" />
                  <span className="truncate">{profile?.email || "-"}</span>
                </p>
                <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <i className="bi bi-telephone text-slate-400" aria-hidden="true" />
                  <span>{form.no_hp_mahasiswa || "-"}</span>
                </p>
                <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <i className="bi bi-mortarboard text-slate-400" aria-hidden="true" />
                  <span>{form.prodi || "-"}</span>
                </p>
              </div>
            </CardBody>
          </Card>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle icon="bi-person-gear">Edit Data Diri</CardTitle>
                <Badge variant="success" size="sm">
                  <i className="bi bi-shield-check mr-1" aria-hidden="true" />
                  Data Aman
                </Badge>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardBody className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Update Foto Profil
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".jpg,.jpeg,.png"
                      onChange={handleFotoChange}
                      className="block w-full text-slate-700 dark:text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950/60 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 transition-all cursor-pointer border border-slate-300 dark:border-slate-700 rounded-lg"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Maksimal 5MB (JPG, PNG)
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nama Lengkap"
                      icon="bi-person"
                      value={form.nama_lengkap}
                      onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
                      required
                    />
                    <Input
                      label="NIM (Nomor Induk)"
                      icon="bi-hash"
                      value={form.nim}
                      onChange={(e) => setForm({ ...form, nim: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Email"
                      type="email"
                      icon="bi-envelope"
                      value={profile?.email || ""}
                      readOnly
                      className="bg-slate-50 dark:bg-slate-800 cursor-not-allowed"
                    />
                    <Input
                      label="No. HP / WhatsApp"
                      icon="bi-telephone"
                      value={form.no_hp_mahasiswa}
                      onChange={(e) => setForm({ ...form, no_hp_mahasiswa: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Program Studi"
                      icon="bi-mortarboard"
                      value={form.prodi}
                      onChange={(e) => setForm({ ...form, prodi: e.target.value })}
                    />
                    <Select
                      label="Jenis Kelamin"
                      value={form.jenis_kelamin}
                      onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })}
                      options={[
                        { value: "", label: "- Pilih -" },
                        { value: "Laki-laki", label: "Laki-laki" },
                        { value: "Perempuan", label: "Perempuan" },
                      ]}
                    />
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                      <i className="bi bi-key text-amber-500" aria-hidden="true" />
                      Ganti Password
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="password"
                        placeholder="Password Baru"
                        value={form.password_baru}
                        onChange={(e) => setForm({ ...form, password_baru: e.target.value })}
                      />
                      <Input
                        type="password"
                        placeholder="Ulangi Password"
                        value={form.konfirmasi_password}
                        onChange={(e) => setForm({ ...form, konfirmasi_password: e.target.value })}
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      * Kosongkan jika tidak ingin mengubah password.
                    </p>
                  </div>
                </CardBody>

                <CardFooter className="justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    icon="bi-floppy"
                    loading={saving}
                  >
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </MahasiswaLayout>
  );
}
