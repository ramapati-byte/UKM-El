// components/DashboardLayout.tsx — Adapter UI lama ke AppShell AdminLTE 4
// Komponen asli disimpan di backup/ui-lama/DashboardLayout.tsx.bak

"use client";

import React from "react";
import AppShell from "./shell/AppShell";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

interface DashboardLayoutProps {
  user: { name: string; email: string; role: string; foto_profil?: string } | null;
  title: string;
  subtitle?: string;
  links?: NavItem[];
  onLogout?: () => void;
  children: React.ReactNode;
}

export default function DashboardLayout({
  user,
  title,
  subtitle,
  children,
}: DashboardLayoutProps) {
  const role = user?.role?.toLowerCase() || "penyelenggara";

  return (
    <AppShell role={role} title={title} subtitle={subtitle}>
      {children}
    </AppShell>
  );
}
