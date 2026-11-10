// app/organizer/members/[id]/page.tsx — Detail anggota + riwayat lintas UKM
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "../../../../components/shell/AppShell";
import { Card, CardBody, CardHeader, CardTitle } from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";
import MemberStatusBadge from "../../../../components/members/MemberStatusBadge";
import MemberHistoryTimeline from "../../../../components/members/MemberHistoryTimeline";
import LoadingSkeleton from "../../../../components/ui/LoadingSkeleton";
import ErrorState from "../../../../components/ui/ErrorState";
import { memberService } from "../../../../services/member.service";
import type { MemberEntity, MemberHistoryItem, MemberStatus } from "../../../../types/member";

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [member, setMember]   = useState<MemberEntity | null>(null);
  const [history, setHistory] = useState<MemberHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [editStatus, setEditStatus] = useState<MemberStatus>("aktif");
  const [toast, setToast]     = useState<{ msg: string; type: "success" | "danger" } | null>(null);

  const showToast = (msg: string, type: "success" | "danger" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [m] = await Promise.all([
        memberService.getMemberById(id),
      ]);
      setMember(m);
      setEditStatus(m.status);
      const hist = await memberService.getMemberHistory(m.mahasiswaId);
      setHistory(hist);
    } catch {
      setError("Gagal memuat data anggota.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!member) return;
    setSaving(true);
    try {
      const updated = await memberService.updateMember(member.id, { status: editStatus });
      setMember(updated);
      showToast("Status berhasil diperbarui.");
    } catch {
      showToast("Gagal memperbarui status.", "danger");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Detail Anggota">
        <div className="p-4 md:p-6">
          <LoadingSkeleton variant="card" rows={6} />
        </div>
      </AppShell>
    );
  }

  if (error || !member) {
    return (
      <AppShell title="Detail Anggota">
        <div className="p-4 md:p-6">
          <ErrorState message={error ?? "Anggota tidak ditemukan."} onRetry={load} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={member.namaLengkap}
      subtitle={`${member.nim} • ${member.prodi ?? ""}`}
      breadcrumbs={[
        { label: "Organizer", href: "/organizer/dashboard" },
        { label: "Anggota", href: "/organizer/members" },
        { label: member.namaLengkap },
      ]}
      actions={
        <Button variant="outline" icon="bi-arrow-left" size="sm" onClick={() => router.back()}>
          Kembali
        </Button>
      }
    >
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2 ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          <i className={`bi ${toast.type === "success" ? "bi-check-circle" : "bi-x-circle"}`} />
          {toast.msg}
        </div>
      )}

      <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom kiri: profil */}
        <div className="lg:col-span-1 space-y-4">
          {/* Avatar card */}
          <Card>
            <CardBody className="flex flex-col items-center text-center py-8">
              <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-4xl font-bold mb-3">
                {member.namaLengkap.charAt(0).toUpperCase()}
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{member.namaLengkap}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{member.email}</p>
              <MemberStatusBadge status={member.status} />
            </CardBody>
          </Card>

          {/* Ubah status */}
          <Card>
            <CardHeader>
              <CardTitle icon="bi-toggle-on">Ubah Status</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as MemberStatus)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                {(["aktif", "nonaktif", "alumni", "pending"] as MemberStatus[]).map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <Button
                variant="primary"
                loading={saving}
                onClick={handleSave}
                className="w-full"
              >
                Simpan Perubahan
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Kolom kanan: info + riwayat */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info detail */}
          <Card>
            <CardHeader>
              <CardTitle icon="bi-person-lines-fill">Informasi Anggota</CardTitle>
            </CardHeader>
            <CardBody>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {[
                  { label: "NIM",              value: member.nim },
                  { label: "Program Studi",    value: member.prodi ?? "—" },
                  { label: "No. HP",           value: member.noHp ?? "—" },
                  { label: "UKM",              value: member.ukmNama },
                  { label: "Divisi",           value: member.divisi ?? "—" },
                  { label: "Jabatan",          value: member.jabatan ?? "—" },
                  {
                    label: "Bergabung",
                    value: new Date(member.periodeGabung).toLocaleDateString("id-ID", { dateStyle: "long" }),
                  },
                  {
                    label: "Tanggal Keluar",
                    value: member.periodeKeluar
                      ? new Date(member.periodeKeluar).toLocaleDateString("id-ID", { dateStyle: "long" })
                      : "—",
                  },
                ].map((row) => (
                  <div key={row.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                    <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                      {row.label}
                    </dt>
                    <dd className="font-medium text-slate-800 dark:text-slate-100">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>

          {/* Riwayat lintas UKM */}
          <Card>
            <CardHeader>
              <CardTitle icon="bi-clock-history">Riwayat Keanggotaan</CardTitle>
            </CardHeader>
            <CardBody>
              <MemberHistoryTimeline history={history} />
            </CardBody>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
