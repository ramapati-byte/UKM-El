// components/org/OrgSwitcher.tsx — Pemilih konteks UKM untuk Super Admin

"use client";

import { useState } from "react";
import { useOrg } from "./OrgContext";
import { ukmService } from "../../services/ukm.service";
import Button from "../ui/Button";

export default function OrgSwitcher() {
  const { ukmId, ukmSlug, setUk, ukmData } = useOrg();
  const [open, setOpen] = useState(false);
  const [ukms, setUkms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUkms = async () => {
    setLoading(true);
    try {
      const res = await ukmService.list({ limit: 50 });
      setUkms(res.data);
    } catch {
      setUkms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = (id: string, slug: string) => {
    const ukm = ukms.find((u) => u.id === id);
    setUk(id, slug, ukm ?? undefined);
    setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setOpen(!open);
          if (open === false) loadUkms();
        }}
      >
        {ukmData?.nama || "Pilih UKM"}
        <i className="bi bi-chevron-down ml-2 text-xs"></i>
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-lg z-50">
          <div className="p-3 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Pilih UKM Aktif</h3>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-sm text-slate-500">Memuat...</div>
            ) : ukms.length === 0 ? (
              <div className="p-3 text-sm text-slate-500">Tidak ada UKM</div>
            ) : (
              <ul>
                {ukms.map((u) => (
                  <li key={u.id}>
                    <button
                      onClick={() => handleSwitch(u.id, u.ukmSlug)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                      <span className="text-slate-900 dark:text-white">{u.nama}</span>
                      {ukmId === u.id ? (
                        <i className="bi bi-check text-indigo-600 dark:text-indigo-400"></i>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}