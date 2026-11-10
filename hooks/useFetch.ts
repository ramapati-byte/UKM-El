// hooks/useFetch.ts — Hook fetch generik dengan loading/error state

"use client";

import { useState, useCallback } from "react";

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useFetch<T>() {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (fn: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await fn();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err: any) {
      setState({
        data: null,
        loading: false,
        error: err?.message || "Terjadi kesalahan",
      });
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}