"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import PublicShell from "@/components/shell/PublicShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { ukmService } from "@/services/ukm.service";
import type { UkmEntity } from "@/types/ukm";
import type { BadgeVariant } from "@/types/common";

const kategoriLabel: Record<string, string> = {
  bem: "BEM",
  himas: "HIMA",
  unit: "Unit Kegiatan",
  km: "Kegiatan Mahasiswa",
};

const statusVariant: Record<string, BadgeVariant> = {
  verified: "success",
  pending: "warning",
  rejected: "danger",
  inactive: "secondary",
};

const statusLabel: Record<string, string> = {
  verified: "Terverifikasi",
  pending: "Menunggu Verifikasi",
  rejected: "Ditolak",
  inactive: "Tidak Aktif",
};

export default function UkmPublicProfilePage({
  params: paramsProp,
}: {
  params: Promise<{ slug: string }>;
}) {
  const params =
    "then" in paramsProp
      ? use(paramsProp as Promise<{ slug: string }>)
      : (paramsProp as { slug: string });
  const [ukm, setUkm] = useState<UkmEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ukmService.getBySlug(params.slug);
      setUkm(data);
      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "UKM tidak ditemukan";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [params.slug]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <PublicShell>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
              </div>
            </div>
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
        </div>
      </PublicShell>
    );
  }

  if (error || !ukm) {
    return (
      <PublicShell>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <i
            className="bi bi-building text-5xl text-slate-300 dark:text-slate-600 mb-4 block"
            aria-hidden="true"
          />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            UKM Tidak Ditemukan
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {error || "Halaman yang Anda cari tidak tersedia."}
          </p>
          <Link href="/ukm">
            <Button>Kembali ke Direktori UKM</Button>
          </Link>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* Header UKM */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {ukm.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ukm.logoUrl}
                alt={ukm.nama}
                className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                <i
                  className="bi bi-building text-3xl text-slate-400 dark:text-slate-500"
                  aria-hidden="true"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white truncate">
                  {ukm.nama}
                </h1>
                <Badge variant={statusVariant[ukm.status] ?? "secondary"} dot>
                  {statusLabel[ukm.status] ?? ukm.status}
                </Badge>
              </div>
              {ukm.singkatan && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {ukm.singkatan}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <i className="bi bi-tag" aria-hidden="true" />
                  {kategoriLabel[ukm.kategori] ?? ukm.kategori}
                </span>
                {ukm.email && (
                  <span className="inline-flex items-center gap-1">
                    <i className="bi bi-envelope" aria-hidden="true" />
                    {ukm.email}
                  </span>
                )}
                {ukm.noHp && (
                  <span className="inline-flex items-center gap-1">
                    <i className="bi bi-telephone" aria-hidden="true" />
                    {ukm.noHp}
                  </span>
                )}
              </div>
            </div>
            <div className="shrink-0">
              <Link href={`/ukm/${ukm.ukmSlug}/recruitment`}>
                <Button variant="primary" icon="bi-person-plus">
                  Daftar Open Recruitment
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Visi & Misi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ukm.visi && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <i
                  className="bi bi-eye text-indigo-600 dark:text-indigo-400"
                  aria-hidden="true"
                />
                Visi
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {ukm.visi}
              </p>
            </div>
          )}
          {ukm.misi && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <i
                  className="bi bi-bullseye text-indigo-600 dark:text-indigo-400"
                  aria-hidden="true"
                />
                Misi
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {ukm.misi}
              </p>
            </div>
          )}
        </div>

        {/* Informasi Detail */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <i
              className="bi bi-info-circle text-indigo-600 dark:text-indigo-400"
              aria-hidden="true"
            />
            Informasi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="Kontak Person" value={ukm.kontakPerson} />
            <InfoRow label="Email" value={ukm.email} />
            <InfoRow label="Telepon" value={ukm.noHp} />
            <InfoRow label="Alamat" value={ukm.alamat} />
            <InfoRow
              label="Kategori"
              value={kategoriLabel[ukm.kategori] ?? ukm.kategori}
            />
            <InfoRow
              label="Status"
              value={statusLabel[ukm.status] ?? ukm.status}
            />
          </div>
        </div>

        {/* Media Sosial */}
        {ukm.mediaSosial && Object.keys(ukm.mediaSosial).length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <i
                className="bi bi-share text-indigo-600 dark:text-indigo-400"
                aria-hidden="true"
              />
              Media Sosial
            </h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(ukm.mediaSosial).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <i className="bi bi-link-45deg" aria-hidden="true" />
                  {platform}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Navigasi Kembali */}
        <div className="flex justify-center">
          <Link href="/ukm">
            <Button variant="outline">
              <i className="bi bi-arrow-left mr-2" aria-hidden="true" />
              Kembali ke Direktori UKM
            </Button>
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">
        {label}
      </span>
      <span className="text-sm text-slate-900 dark:text-white">
        {value || "-"}
      </span>
    </div>
  );
}
