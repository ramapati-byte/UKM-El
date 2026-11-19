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
    programService
      .ranking()
      .then((data) => {
        setRanking(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AppShell
      title="Peringkat UKM"
      subtitle="Skor evaluasi dan peringkat kinerja UKM tiap periode"
      role="superadmin"
      breadcrumbs={[
        { label: "Dashboard", href: "/admin/dashboard" },
        { label: "Peringkat UKM" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader title="Peringkat & Kinerja UKM" />

        {/* Podium Highlight */}
        {!loading && ranking.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Juara 2 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-center order-2 md:order-1 flex flex-col items-center justify-center">
              <span className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold mb-2">
                🥈 2
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white">
                {ranking[1].ukmNama}
              </h3>
              <p className="text-xs text-slate-500 mb-2">Peringkat 2</p>
              <Badge variant="secondary">Skor: {ranking[1].skor}</Badge>
            </div>

            {/* Juara 1 */}
            <div className="bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900 border-2 border-amber-300 dark:border-amber-700/60 rounded-xl p-6 text-center order-1 md:order-2 flex flex-col items-center justify-center shadow-xs">
              <span className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-extrabold text-lg mb-2">
                🥇 1
              </span>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {ranking[0].ukmNama}
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mb-2">
                UKM Berprestasi Terbaik
              </p>
              <Badge variant="warning">Skor: {ranking[0].skor}</Badge>
            </div>

            {/* Juara 3 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-center order-3 flex flex-col items-center justify-center">
              <span className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 flex items-center justify-center font-bold mb-2">
                🥉 3
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white">
                {ranking[2].ukmNama}
              </h3>
              <p className="text-xs text-slate-500 mb-2">Peringkat 3</p>
              <Badge variant="secondary">Skor: {ranking[2].skor}</Badge>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <DataTable
            loading={loading}
            columns={[
              {
                key: "peringkat",
                label: "Peringkat",
                align: "center",
                render: (_row, idx) => (
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    #{idx + 1}
                  </span>
                ),
              },
              {
                key: "ukmNama",
                label: "Nama UKM",
                render: (row) => (
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {row.ukmNama}
                  </span>
                ),
              },
              {
                key: "skor",
                label: "Skor Total",
                render: (row) => (
                  <Badge variant="primary" dot>
                    {row.skor} Poin
                  </Badge>
                ),
              },
              {
                key: "totalKegiatan",
                label: "Kegiatan Terealisasi",
                align: "center",
                render: (row) => `${row.totalKegiatan} Kegiatan`,
              },
              {
                key: "totalAnggota",
                label: "Total Anggota",
                align: "center",
                render: (row) => `${row.totalAnggota} Anggota`,
              },
            ]}
            data={ranking}
            rowActions={[]}
          />
        </div>
      </div>
    </AppShell>
  );
}
