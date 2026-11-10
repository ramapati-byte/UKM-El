// hooks/useOrg.ts — Hook konteks UKM aktif

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getActiveUkId,
  setActiveUkId,
  getActiveUkSlug,
  setActiveUkSlug,
  clearActiveUk,
  isMultiTenantEnabled,
} from "../lib/tenant";

export function useOrg() {
  const [ukmId, setUkmIdState] = useState<string | null>(null);
  const [ukmSlug, setUkmSlugState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = getActiveUkId();
    const slug = getActiveUkSlug();
    setUkmIdState(id);
    setUkmSlugState(slug);
    setLoaded(true);
  }, []);

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