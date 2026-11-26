"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import AppShell from "@/components/shell/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";

interface AuditRow {
  id: number | string;
  aktor: string;
  aksi: string;
  target: string;
  tanggal: string;
  detail: string;
}

export default function AuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{
        data?: Array<{
          id: number;
          user_name?: string;
          user_role?: string;
          aksi: string;
          modul: string;
          detail?: string;
          created_at?: string;
        }>;
      }>("/admin/audit")
      .then((res) => {
        const list = res.data?.data ?? [];
        setRows(
          list.map((r) => ({
            id: r.id,
            aktor: r.user_name || r.user_role || "sistem",
            aksi: r.aksi,
            target: r.modul,
            tanggal: r.created_at
              ? new Date(r.created_at).toLocaleString("id-ID")
              : "-",
            detail: r.detail || "-",
          }))
        );
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell title="Audit Log" subtitle="Riwayat aktivitas sistem">
      <PageHeader title="Audit Trail" />
      <DataTable
        loading={loading}
        columns={[
          { key: "aktor", label: "Aktor" },
          { key: "aksi", label: "Aksi" },
          { key: "target", label: "Target" },
          { key: "tanggal", label: "Tanggal" },
          { key: "detail", label: "Detail" },
        ]}
        data={rows}
      />
    </AppShell>
  );
}
