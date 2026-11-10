// app/organizer/members/page.tsx — Daftar anggota UKM
"use client";

import { useState, useEffect, useCallback } from "react";
import AppShell from "../../../components/shell/AppShell";
import { Card, CardBody, CardHeader, CardTitle, CardTools } from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Pagination from "../../../components/ui/Pagination";
import StatCard from "../../../components/ui/StatCard";
import Button from "../../../components/ui/Button";
import MemberStatusBadge from "../../../components/members/MemberStatusBadge";
import Modal from "../../../components/ui/Modal";
import { memberService } from "../../../services/member.service";
import type { MemberEntity, MemberStatus, MemberStats } from "../../../types/member";
import type { Column } from "../../../components/ui/DataTable";
import type { PaginationMeta } from "../../../types/common";
import ErrorState from "../../../components/ui/ErrorState";
import LoadingSkeleton from "../../../components/ui/LoadingSkeleton";

const STATUS_OPTIONS: { value: MemberStatus | "all"; label: string }[] = [
  { value: "all",      label: "Semua Status" },
  { value: "aktif",    label: "Aktif"        },
  { value: "nonaktif", label: "Nonaktif"     },
  { value: "alumni",   label: "Alumni"       },
  { value: "pending",  label: "Menunggu"     },
];

export default function MembersPage() {
  const [members, setMembers]       = useState<MemberEntity[]>([]);
  const [stats, setStats]           = useState<MemberStats | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({ current_page: 1, total_pages: 1, total_records: 0, limit: 10 });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState<MemberStatus | "all">("all");
  const [page, setPage]             = useState(1);

  const [detailOpen, setDetailOpen]     = useState(false);
  const [selected, setSelected]         = useState<MemberEntity | null>(null);
  const [updateStatus, setUpdateStatus] = useState<MemberStatus>("aktif");
  const [saving, setSaving]             = useState(false);
  const [toast, setToast]               = useState<{ msg: string; type: "success" | "danger" } | null>(null);

  const showToast = (msg: string, type: "success" | "danger" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, st] = await Promise.all([
        memberService.listMembers({ search, status: statusFilter, page, limit: 10 }),
        stats === null ? memberService.getMemberStats() : Promise.resolve(stats),
      ]);
      setMembers(res.data);
      setPagination(res.pagination);
      setStats(st as MemberStats);
    } catch {
      setError("Gagal memuat data anggota. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const handleSaveStatus = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await memberService.updateMember(selected.id, { status: updateStatus });
      showToast("Status anggota berhasil diperbarui.");
      setDetailOpen(false);
      load();
    } catch {
      showToast("Gagal memperbarui status.", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus anggota "${nama}" dari UKM?`)) return;
    try {
      await memberService.deleteMember(id);
      showToast("Anggota berhasil dihapus.");
      load();
    } catch {
      showToast("Gagal menghapus anggota.", "danger");
    }
  };

  const handleExport = () => {
    const rows = [
      ["NIM", "Nama", "Email", "Prodi", "Divisi", "Jabatan", "Status", "Bergabung"],
      ...members.map((m) => [
        m.nim,
        m.namaLengkap,
        m.email,
        m.prodi ?? "",
        m.divisi ?? "",
        m.jabatan ?? "",
        m.status,
        m.periodeGabung,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `anggota-ukm-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<MemberEntity>[] = [
    {
      key: "nim",
      header: "NIM",
      render: (m) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{m.nim}</span>
      ),
    },
    {
      key: "namaLengkap",
      header: "Nama Anggota",
      render: (m) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm shrink-0">
            {m.namaLengkap.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{m.namaLengkap}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{m.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "prodi",
      header: "Prodi",
      render: (m) => <span className="text-xs">{m.prodi ?? "—"}</span>,
    },
    {
      key: "divisi",
      header: "Divisi / Jabatan",
      render: (m) => (
        <div className="text-xs">
          <p className="font-medium text-slate-700 dark:text-slate-200">{m.divisi ?? "—"}</p>
          {m.jabatan && <p className="text-slate-400">{m.jabatan}</p>}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (m) => <MemberStatusBadge status={m.status} />,
    },
    {
      key: "periodeGabung",
      header: "Bergabung",
      render: (m) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {new Date(m.periodeGabung).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "right",
      render: (m) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            title="Lihat detail"
            onClick={() => { setSelected(m); setUpdateStatus(m.status); setDetailOpen(true); }}
            className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
          >
            <i className="bi bi-eye text-sm" />
          </button>
          <button
            type="button"
            title="Hapus"
            onClick={() => handleDelete(m.id, m.namaLengkap)}
            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
          >
            <i className="bi bi-trash text-sm" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AppShell
      title="Manajemen Anggota"
      subtitle="Kelola database anggota UKM"
      breadcrumbs={[
        { label: "Organizer", href: "/organizer/dashboard" },
        { label: "Anggota" },
      ]}
      actions={
        <Button variant="outline" icon="bi-download" size="sm" onClick={handleExport}>
          Ekspor CSV
        </Button>
      }
    >
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2 transition-all ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          <i className={`bi ${toast.type === "success" ? "bi-check-circle" : "bi-x-circle"}`} />
          {toast.msg}
        </div>
      )}

      <div className="space-y-6 p-4 md:p-6">
        {/* Stat cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard title="Total Anggota" value={stats.total}    icon="bi-people-fill"    variant="primary"  />
            <StatCard title="Aktif"          value={stats.aktif}    icon="bi-person-check"   variant="success"  />
            <StatCard title="Alumni"         value={stats.alumni}   icon="bi-person-dash"    variant="info"     />
            <StatCard title="Menunggu"       value={stats.pending}  icon="bi-hourglass-split" variant="warning" />
          </div>
        )}

        {/* Filter + tabel */}
        <Card>
          <CardHeader>
            <CardTitle icon="bi-people">Daftar Anggota</CardTitle>
            <CardTools>
              <select
                value={statusFilter}
                onChange={(e) => { setStatus(e.target.value as MemberStatus | "all"); setPage(1); }}
                className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </CardTools>
          </CardHeader>

          {/* Search */}
          <div className="px-5 pt-4 pb-2">
            <div className="relative max-w-xs">
              <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="search"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Cari nama, NIM, email..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          <CardBody className="p-0">
            {error ? (
              <ErrorState message={error} onRetry={load} />
            ) : loading ? (
              <LoadingSkeleton variant="table" rows={5} />
            ) : (
              <DataTable
                columns={columns}
                data={members}
                keyExtractor={(m) => m.id}
                emptyTitle="Belum ada anggota"
                emptyMessage="Tambahkan anggota melalui fitur open recruitment."
                renderMobileCard={(m) => (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {m.namaLengkap.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{m.namaLengkap}</p>
                          <p className="text-xs text-slate-500">{m.nim}</p>
                        </div>
                      </div>
                      <MemberStatusBadge status={m.status} />
                    </div>
                    <p className="text-xs text-slate-500">{m.prodi} {m.divisi ? `• ${m.divisi}` : ""}</p>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => { setSelected(m); setUpdateStatus(m.status); setDetailOpen(true); }}
                        className="flex-1 text-xs py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 font-semibold"
                      >
                        Detail
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id, m.namaLengkap)}
                        className="flex-1 text-xs py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 font-semibold"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              />
            )}
          </CardBody>

          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            totalRecords={pagination.total_records}
            onPageChange={setPage}
          />
        </Card>
      </div>

      {/* Modal detail anggota */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Detail Anggota"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Tutup</Button>
            <Button variant="primary" loading={saving} onClick={handleSaveStatus}>
              Simpan Status
            </Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold shrink-0">
                {selected.namaLengkap.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">{selected.namaLengkap}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selected.nim} • {selected.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Prodi",     value: selected.prodi },
                { label: "Divisi",    value: selected.divisi },
                { label: "Jabatan",   value: selected.jabatan },
                { label: "No. HP",    value: selected.noHp },
                { label: "Bergabung", value: new Date(selected.periodeGabung).toLocaleDateString("id-ID", { dateStyle: "long" }) },
                { label: "Keluar",    value: selected.periodeKeluar ? new Date(selected.periodeKeluar).toLocaleDateString("id-ID", { dateStyle: "long" }) : "—" },
              ].map((row) => (
                <div key={row.label}>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">{row.label}</p>
                  <p className="text-slate-800 dark:text-slate-200">{row.value ?? "—"}</p>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Ubah Status
              </label>
              <select
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value as MemberStatus)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                {(["aktif", "nonaktif", "alumni", "pending"] as MemberStatus[]).map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            <a
              href={`/organizer/members/${selected.id}`}
              className="block text-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline py-1"
            >
              <i className="bi bi-arrow-right-circle mr-1" />
              Lihat Halaman Detail Lengkap
            </a>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
