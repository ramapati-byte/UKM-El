// components/org/OrgSwitcher.tsx — Modern Context Switcher untuk Organisasi / UKM

"use client";

import { useState, useEffect, useRef } from "react";
import { useOrg } from "./OrgContext";
import { ukmService } from "../../services/ukm.service";
import type { UkmEntity } from "../../types/ukm";
import Button from "../ui/Button";

export default function OrgSwitcher() {
  const { ukmId, setUk, ukmData } = useOrg();
  const [open, setOpen] = useState(false);
  const [ukms, setUkms] = useState<UkmEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

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
    <div className="relative inline-block" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setOpen(!open);
          if (!open) loadUkms();
        }}
        className="rounded-xl border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800"
      >
        <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5" />
        <span className="font-semibold">{ukmData?.nama || "Pilih UKM"}</span>
        <i className="bi bi-chevron-down ml-2 text-[10px] text-slate-400"></i>
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pilih UKM Aktif
            </h3>
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5">
            {loading ? (
              <div className="p-4 text-center text-xs text-slate-400">Memuat...</div>
            ) : ukms.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">Tidak ada data UKM</div>
            ) : (
              <ul className="space-y-1">
                {ukms.map((u) => {
                  const isSelected = ukmId === u.id;
                  return (
                    <li key={u.id}>
                      <button
                        onClick={() => handleSwitch(u.id, u.ukmSlug)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="truncate">{u.nama}</span>
                        {isSelected && (
                          <i className="bi bi-check2 text-indigo-600 dark:text-indigo-400 text-sm"></i>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
