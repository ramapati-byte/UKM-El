// components/MahasiswaLayout.tsx — Adapter UI lama ke AppShell AdminLTE 4
// Komponen asli disimpan di backup/ui-lama/MahasiswaLayout.tsx.bak

"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AppShell from "./shell/AppShell";
import type { NavSection } from "../lib/navigation";
import api from "../lib/api";

const PAGE_TITLES: Record<string, string> = {
  "/mahasiswa/dashboard": "Dashboard",
  "/mahasiswa/katalog": "Katalog Event",
  "/mahasiswa/tiket": "Aktivitas Saya",
  "/mahasiswa/transaksi": "Transaksi",
  "/mahasiswa/sertifikat": "Sertifikat",
  "/mahasiswa/diskusi": "Diskusi",
  "/mahasiswa/profil": "Profil Saya",
  "/mahasiswa/kuesioner": "Kuesioner",
  "/mahasiswa/kelola-pendaftar": "Kelola Pendaftar",
};

function resolveTitle(pathname: string): string {
  const key = Object.keys(PAGE_TITLES)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];
  return key ? PAGE_TITLES[key] : "Dashboard";
}

export default function MahasiswaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isPanitia, setIsPanitia] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("user")) return;

    api
      .get("/mahasiswa/panitia-events")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setIsPanitia(true);
        }
      })
      .catch(() => {
        setIsPanitia(false);
      });
  }, []);

  const sections: NavSection[] = [
    {
      section: "MENU UTAMA",
      items: [
        { href: "/mahasiswa/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
        { href: "/mahasiswa/katalog", icon: "bi-grid-3x3-gap", label: "Katalog Event" },
      ],
    },
    {
      section: "AKTIVITAS",
      items: [{ href: "/mahasiswa/tiket", icon: "bi-activity", label: "Aktivitas" }],
    },
    ...(isPanitia
      ? [
          {
            section: "KEPANITIAAN",
            items: [
              { href: "/mahasiswa/kelola-pendaftar", icon: "bi-people", label: "Kelola Pendaftar" },
            ],
          },
        ]
      : []),
    {
      section: "AKUN",
      items: [{ href: "/mahasiswa/profil", icon: "bi-person", label: "Profil Saya" }],
    },
  ];

  return (
    <AppShell
      role="mahasiswa"
      navSections={sections}
      title={resolveTitle(pathname)}
      subtitle="Sistem Informasi Event Kampus"
    >
      {children}
    </AppShell>
  );
}
