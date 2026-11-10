"use client";

import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import api from "../../lib/axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import Card, { CardBody } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Callout from "../../components/ui/Callout";

interface ApiError {
  response?: { data?: { message?: string } };
}

interface GoogleResponse {
  access_token?: string;
  credential?: string;
}

function LoginContent() {
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

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", {
        identifier: formData.identifier,
        password: formData.password,
        type: "mahasiswa",
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: "Selamat datang kembali!",
        timer: 1500,
        showConfirmButton: false,
      });
      router.push("/mahasiswa/dashboard");
    } catch (err: unknown) {
      const message = (err as ApiError).response?.data?.message;
      setError(message || "Gagal login. Periksa kembali data Anda.");
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
        action: "login",
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: "Selamat datang kembali!",
        timer: 1500,
        showConfirmButton: false,
      });
      router.push("/mahasiswa/dashboard");
    } catch (err: unknown) {
      const message = (err as ApiError).response?.data?.message;
      setError(message || "Gagal login via Google");
    }
  };

  const handleGoogleError = () => {
    setError("Login Google dibatalkan atau gagal.");
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
  });

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
            BEM El Rahma
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Masuk sebagai Mahasiswa ke CampusEvent
          </p>
        </div>

        <Card>
          <CardBody className="space-y-5">
            {error && (
              <Callout variant="danger" title="Login Gagal">
                {error}
              </Callout>
            )}

            <form onSubmit={handleManualLogin} className="space-y-4">
              <Input
                label="NIM atau Email"
                type="text"
                name="identifier"
                icon="bi-person"
                required
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Masukkan NIM atau Email Anda"
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
                icon="bi-box-arrow-in-right"
                className="w-full"
              >
                {loading ? "Memproses..." : "Masuk Akun"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white dark:bg-slate-900 text-xs font-medium text-slate-400 dark:text-slate-500">
                  Atau masuk dengan
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
              Masuk dengan Google
            </Button>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-500 transition-colors"
              >
                Daftar di sini
              </Link>
            </p>
          </CardBody>
        </Card>

        <Callout variant="info" className="mt-5">
          Penyelenggara atau admin?{" "}
          <Link
            href="/login/admin"
            className="font-semibold underline underline-offset-2 hover:text-sky-700 dark:hover:text-sky-300"
          >
            Masuk melalui Portal Admin
          </Link>
        </Callout>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <GoogleOAuthProvider
      clientId={
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "dummy_client_id_for_now"
      }
    >
      <LoginContent />
    </GoogleOAuthProvider>
  );
}
