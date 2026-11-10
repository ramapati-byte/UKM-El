"use client";

import api from "../../../lib/axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Card, { CardBody } from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Callout from "../../../components/ui/Callout";

interface ApiError {
  response?: { data?: { message?: string } };
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", {
        identifier: formData.identifier,
        password: formData.password,
        type: "user", // backend expects type 'user' for penyelenggara/superadmin
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role === "superadmin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/organizer/dashboard");
      }
    } catch (err: unknown) {
      const message = (err as ApiError).response?.data?.message;
      setError(
        message || "Gagal login. Periksa kembali email dan password Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-bem.png"
            alt="Logo BEM El Rahma"
            className="w-16 h-16 object-contain mx-auto mb-3 rounded"
          />
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Portal Admin
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Masuk sebagai Penyelenggara / Admin
          </p>
        </div>

        <Card>
          <CardBody className="space-y-5">
            {error && (
              <Callout variant="danger" title="Login Gagal">
                {error}
              </Callout>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <Input
                label="Email"
                type="email"
                name="identifier"
                icon="bi-envelope"
                required
                value={formData.identifier}
                onChange={handleChange}
                placeholder="admin@kampus.ac.id"
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
                icon="bi-shield-lock"
                className="w-full"
              >
                {loading ? "Memproses..." : "Masuk Portal"}
              </Button>
            </form>

            <Callout variant="info">
              Gunakan akun penyelenggara atau superadmin yang terdaftar pada
              sistem.
            </Callout>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Masuk sebagai{" "}
              <Link
                href="/login"
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-500 transition-colors"
              >
                Mahasiswa?
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
