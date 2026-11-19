// hooks/useOrg.ts — Hook konteks UKM aktif

"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import {
  getActiveUkId,
  setActiveUkId,
  getActiveUkSlug,
  setActiveUkSlug,
  clearActiveUk,
  isMultiTenantEnabled,
} from "../lib/tenant";

const emptySubscribe = () => () => {};

export function useOrg() {
  const loaded = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [ukmId, setUkmIdState] = useState<string | null>(() => {
    if (typeof window !== "undefined") return getActiveUkId();
    return null;
  });
  const [ukmSlug, setUkmSlugState] = useState<string | null>(() => {
    if (typeof window !== "undefined") return getActiveUkSlug();
    return null;
  });

  const setUk = useCallback((id: string, slug: string) => {
    setActiveUkId(id);
    setActiveUkSlug(slug);
    setUkmIdState(id);
    setUkmSlugState(slug);
  }, []);

  const clearUk = useCallback(() => {
    clearActiveUk();
    setUkmIdState(null);
    setUkmSlugState(null);
  }, []);

  return {
    ukmId,
    ukmSlug,
    loaded,
    setUk,
    clearUk,
    isMultiTenant: isMultiTenantEnabled(),
  };
}