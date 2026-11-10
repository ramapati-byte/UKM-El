"use client";

import AppShell from "@/components/shell/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";

const MOCK_AUDIT = [
  { id: 1, aktor: "admin", aksi: "Verifikasi UKM BEM", target: "BEM El Rahma", tanggal: "2026-11-02 08:00", detail: "Status diubah menjadi verified" },
  { id: 2, aktor: "pengurus", aksi: "Buat Surat Izin", target: "SIK/2026/11/001", tanggal: "2026-11-01 09:00", detail: "Surat izin kegiatan KTI" },
  { id: 3, aktor: "bendahara", aksi: "Ajukan Dana", target: "FIN/2026/11/003", tanggal: "2026-11-05 10:00", detail: "Pengajuan sewa ruang seminar" },
];

export default function AuditPage() {
  return (
    <AppShell title="Audit Log" subtitle="Riwayat aktivitas sistem">
      <PageHeader title="Audit Trail" />
      <DataTable
        columns={[
          { key: "aktor", label: "Aktor" },
          { key: "aksi", label: "Aksi" },
          { key: "target", label: "Target" },
          { key: "tanggal", label: "Tanggal" },
          { key: "detail", label: "Detail" },
        ]}
        data={MOCK_AUDIT}
      />
    </AppShell>
  );
}