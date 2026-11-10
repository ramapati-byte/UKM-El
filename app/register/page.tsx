"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import api from "@/lib/axios";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import Swal from "sweetalert2";
import Card, { CardBody } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Callout from "@/components/ui/Callout";

interface ApiError {
  response?: { data?: { message?: string } };
}

interface GoogleResponse {
  access_token?: string;
  credential?: string;
}

function RegisterContent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    email: "",
    password: "",
    nim: "",
    prodi: "",
    no_hp_mahasiswa: "",
    role: "mahasiswa", // 'mahasiswa' atau 'penyelenggara'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (formData.role === "mahasiswa") {
        const payload = {
          nim: formData.nim,
          email: formData.email,
          password: formData.password,
          nama_lengkap: formData.nama_lengkap,
          jenis_kelamin: "Laki-laki", // default for now, can add to form
          prodi: formData.prodi || "-",
          no_hp_mahasiswa: formData.no_hp_mahasiswa || "-",
        };
        const response = await api.post("/auth/register/mahasiswa", payload);
        Swal.fire({
          icon: "success",
          title: "Registrasi Berhasil",
          text: response.data.message,
          timer: 1500,
          showConfirmButton: false,
        });
        router.push("/login");
      } else {
        const payload = {
          email: formData.email,
          password: formData.password,
          nama_lengkap: formData.nama_lengkap,
          no_whatsapp: formData.no_hp_mahasiswa || "-",
          jenis_kelamin: "Laki-laki",
          role: "penyelenggara",
        };
        const response = await api.post("/auth/register/user", payload);
        Swal.fire({
          icon: "success",
          title: "Registrasi Berhasil",
          text: response.data.message,
          timer: 1500,
          showConfirmButton: false,
        });
        router.push("/login/admin");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Terjadi kesalahan saat registrasi."
        );
      } else {
        setError("Terjadi kesalahan sistem yang tidak diketahui.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: GoogleResponse) => {
    try {
      const tokenToUse =
        credentialResponse.access_token || credentialResponse.credential;
      const res = await api.post("/auth/google", {
        token: tokenToUse,
        action: "register",
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      Swal.fire({
        icon: "success",
        title: "Registrasi Berhasil",
        text: "Selamat datang di CampusEvent!",
        timer: 1500,
        showConfirmButton: false,
      });
      router.push("/mahasiswa/dashboard");
    } catch (err: unknown) {
      const message = (err as ApiError).response?.data?.message;
      setError(message || "Gagal login via Google");
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError("Login Google dibatalkan atau gagal."),
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 text-2xl">
            <i className="bi bi-person-plus" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Buat Akun
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Bergabung dengan ekosistem CampusEvent
          </p>
        </div>

        <Card>
          <CardBody className="space-y-5">
            {error && (
              <Callout variant="danger" title="Registrasi Gagal">
                {error}
              </Callout>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nama Lengkap"
                type="text"
                name="nama_lengkap"
                icon="bi-person"
                required
                value={formData.nama_lengkap}
                onChange={handleChange}
                placeholder="John Doe"
              />

              {formData.role === "mahasiswa" && (
                <Input
                  label="NIM"
                  type="text"
                  name="nim"
                  icon="bi-hash"
                  required={formData.role === "mahasiswa"}
                  value={formData.nim}
                  onChange={handleChange}
                  placeholder="Contoh: 12345678"
                />
              )}

              <Input
                label="Email"
                type="email"
                name="email"
                icon="bi-envelope"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="email@kampus.ac.id"
              />

              <Input
                label="Password"
                type="password"
                name="password"
                icon="bi-lock"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />

              <Button
                type="submit"
                size="lg"
                loading={loading}
                icon="bi-person-plus"
                className="w-full"
              >
                {loading ? "Memproses..." : "Daftar Sekarang"}
              </Button>
            </form>

            {formData.role === "mahasiswa" && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-white dark:bg-slate-900 text-xs font-medium text-slate-400 dark:text-slate-500">
                      Atau daftar dengan
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  icon="bi-google"
                  className="w-full"
                  onClick={() => login()}
                >
                  Daftar dengan Google
                </Button>
              </>
            )}

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-500 transition-colors"
              >
                Masuk di sini
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <GoogleOAuthProvider
      clientId={
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "dummy_client_id_for_now"
      }
    >
      <RegisterContent />
    </GoogleOAuthProvider>
  );
}
