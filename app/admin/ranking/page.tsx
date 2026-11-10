"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import { programService } from "@/services/program.service";
import type { RankingEntry } from "@/types/program";

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    programService.ranking().then(data => {
      setRanking(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppShell title="Peringkat UKM">
        <div className="flex items-center justify-center min-h-[400px]">Memuat data...</div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Peringkat UKM" subtitle="Skor dan peringkat UKM tiap periode">
      <PageHeader title="Peringkat UKM" />
      <DataTable
        columns={[
          { key: "peringkat", label: "Peringkat" },
          { key: "ukmNama", label: "UKM" },
          { key: "skor", label: "Skor" },
          { key: "totalKegiatan", label: "Total Kegiatan" },
          { key: "totalAnggota", label: "Total Anggota" },
        ]}
        data={ranking.map((r, i) => ({
          id: r.ukmId,
          peringkat: i + 1,
          ukmNama: r.ukmNama,
          skor: r.skor,
          totalKegiatan: r.totalKegiatan,
          totalAnggota: r.totalAnggota,
        }))}
        rowActions={[]}
      />
    </AppShell>
  );
}