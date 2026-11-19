// components/org/OrgContext.tsx — Konteks UKM aktif

"use client";

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";
import type { UkmEntity } from "../../types/ukm";
import {
  getActiveUkId,
  setActiveUkId,
  getActiveUkSlug,
  setActiveUkSlug,
  clearActiveUk,
} from "../../lib/tenant";

const emptySubscribe = () => () => {};

export interface OrgContextType {
  ukmId: string | null;
  ukmSlug: string | null;
  ukmData: UkmEntity | null;
  setUk: (id: string, slug: string, data?: UkmEntity) => void;
  clearUk: () => void;
  isMultiTenant: boolean;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: ReactNode }) {
  const loaded = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [ukmId, setUkmId] = useState<string | null>(() => {
    if (typeof window !== "undefined") return getActiveUkId();
    return null;
  });
  const [ukmSlug, setUkmSlug] = useState<string | null>(() => {
    if (typeof window !== "undefined") return getActiveUkSlug();
    return null;
  });
  const [ukmData, setUkmData] = useState<UkmEntity | null>(null);

  const setUk = (id: string, slug: string, data?: UkmEntity) => {
    setActiveUkId(id);
    setActiveUkSlug(slug);
    setUkmId(id);
    setUkmSlug(slug);
    if (data) setUkmData(data);
  };

  const clearUk = () => {
    clearActiveUk();
    setUkmId(null);
    setUkmSlug(null);
    setUkmData(null);
  };

  if (!loaded) return null;

  return (
    <OrgContext.Provider value={{ ukmId, ukmSlug, ukmData, setUk, clearUk, isMultiTenant: true }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg harus digunakan di dalam OrgProvider");
  return ctx;
}