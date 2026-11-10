// components/events/CommitteeTable.tsx — Tabel manajemen kepanitiaan event

"use client";

import React from "react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import EmptyState from "../ui/EmptyState";
import LoadingSkeleton from "../ui/LoadingSkeleton";
import type { EventCommittee } from "../../types/event";

interface CommitteeTableProps {
  committees: EventCommittee[];
  loading?: boolean;
  onAddClick: () => void;
  onDeleteClick: (committee: EventCommittee) => void;
  canManage?: boolean;
}

export default function CommitteeTable({
  committees,
  loading = false,
  onAddClick,
  onDeleteClick,
  canManage = true,
}: CommitteeTableProps) {
  if (loading) {
    return <LoadingSkeleton variant="table" rows={4} />;
  }

  if (committees.length === 0) {
    return (
      <EmptyState
        icon="bi-person-badge"
        title="Belum Ada Panitia Terdaftar"
        message="Susun struktur kepanitiaan (Ketua Pelaksana, Sekretaris, Bendahara, Divisi Acara, dll.) untuk mengoordinasikan kegiatan ini."
        action={
          canManage ? (
            <Button
              variant="primary"
              size="sm"
              icon="bi-person-plus"
              onClick={onAddClick}
            >
              Tambah Panitia Pertama
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>Daftar Panitia Pelaksana</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              {committees.length} Orang
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Panitia yang terdaftar memiliki hak akses kelola presensi scan QR event ini.
          </p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            size="sm"
            icon="bi-person-plus"
            onClick={onAddClick}
            className="font-bold"
          >
            Tambah Panitia
          </Button>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="px-4 py-3.5">Nama & Kontak</th>
              <th className="px-4 py-3.5">Peran / Jabatan</th>
              <th className="px-4 py-3.5">Divisi</th>
              {canManage && <th className="px-4 py-3.5 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {committees.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Nama & Kontak */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{c.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        {c.email && (
                          <span className="flex items-center gap-1">
                            <i className="bi bi-envelope text-slate-400" aria-hidden="true" />
                            <span>{c.email}</span>
                          </span>
                        )}
                        {c.phone && (
                          <span className="flex items-center gap-1">
                            <i className="bi bi-whatsapp text-emerald-500" aria-hidden="true" />
                            <span>{c.phone}</span>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="px-4 py-3.5">
                  <Badge variant="primary" size="sm">
                    {c.role}
                  </Badge>
                </td>

                {/* Divisi */}
                <td className="px-4 py-3.5">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {c.division || "Umum"}
                  </span>
                </td>

                {/* Aksi */}
                {canManage && (
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon="bi-trash"
                      onClick={() => onDeleteClick(c)}
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      aria-label={`Hapus ${c.name} dari panitia`}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {committees.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-100">{c.name}</p>
                  <p className="text-[11px] text-slate-500">{c.email || c.phone || "Mahasiswa"}</p>
                </div>
              </div>

              {canManage && (
                <Button
                  size="sm"
                  variant="ghost"
                  icon="bi-trash"
                  onClick={() => onDeleteClick(c)}
                  className="text-red-600 p-1.5"
                  aria-label={`Hapus ${c.name}`}
                />
              )}
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
              <Badge variant="primary" size="sm">{c.role}</Badge>
              <span className="text-[11px] font-semibold text-slate-500">
                Divisi: {c.division || "Umum"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
