// hooks/useEvents.ts — Hook untuk query daftar event dengan filter & pagination

"use client";

import { useState, useEffect, useCallback } from "react";
import type { EventEntity, EventQuery } from "../types/event";
import type { PaginationMeta } from "../types/common";
import { eventService } from "../services/event.service";

interface UseEventsResult {
  events: EventEntity[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setSearch: (s: string) => void;
  setPage: (p: number) => void;
  query: EventQuery;
  updateQuery: (q: Partial<EventQuery>) => void;
}

export function useEvents(initialQuery: EventQuery = {}): UseEventsResult {
  const [query, setQuery] = useState<EventQuery>({
    page: 1,
    limit: 10,
    ...initialQuery,
  });
  const [events, setEvents] = useState<EventEntity[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await eventService.list(query);
      setEvents(res.data);
      setPagination(res.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat data event");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const setSearch = useCallback((search: string) => {
    setQuery((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  }, []);

  const updateQuery = useCallback((newQuery: Partial<EventQuery>) => {
    setQuery((prev) => ({ ...prev, ...newQuery, page: 1 }));
  }, []);

  return {
    events,
    pagination,
    loading,
    error,
    refetch: fetchEvents,
    setSearch,
    setPage,
    query,
    updateQuery,
  };
}
