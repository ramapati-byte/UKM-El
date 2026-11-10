// hooks/useEventCalendar.ts — Hook pengelolaan state kalender bulan & minggu

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { CalendarEvent } from "../types/event";
import { eventService } from "../services/event.service";
import {
  addMonths,
  addDays,
  monthMatrix,
  weekMatrix,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "../lib/date";

export type CalendarViewMode = "month" | "week";

interface UseEventCalendarResult {
  currentDate: Date;
  viewMode: CalendarViewMode;
  setViewMode: (mode: CalendarViewMode) => void;
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  selectedUkm: string;
  setSelectedUkm: (ukmId: string) => void;
  next: () => void;
  prev: () => void;
  today: () => void;
  setDate: (d: Date) => void;
  refetch: () => Promise<void>;
  monthDays: Date[][];
  weekDays: Date[];
}

export function useEventCalendar(initialDate = new Date()): UseEventCalendarResult {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [selectedUkm, setSelectedUkm] = useState<string>("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let from: Date;
      let to: Date;

      if (viewMode === "month") {
        from = startOfWeek(startOfMonth(currentDate));
        to = endOfWeek(endOfMonth(currentDate));
      } else {
        from = startOfWeek(currentDate);
        to = endOfWeek(currentDate);
      }

      const list = await eventService.getCalendar(
        from.toISOString(),
        to.toISOString(),
        selectedUkm || undefined
      );
      setEvents(list);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat agenda kalender");
    } finally {
      setLoading(false);
    }
  }, [currentDate, viewMode, selectedUkm]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const next = useCallback(() => {
    setCurrentDate((prev) =>
      viewMode === "month" ? addMonths(prev, 1) : addDays(prev, 7)
    );
  }, [viewMode]);

  const prev = useCallback(() => {
    setCurrentDate((prev) =>
      viewMode === "month" ? addMonths(prev, -1) : addDays(prev, -7)
    );
  }, [viewMode]);

  const today = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const monthDays = useMemo(
    () => monthMatrix(currentDate.getFullYear(), currentDate.getMonth()),
    [currentDate]
  );

  const weekDays = useMemo(() => weekMatrix(currentDate), [currentDate]);

  return {
    currentDate,
    viewMode,
    setViewMode,
    events,
    loading,
    error,
    selectedUkm,
    setSelectedUkm,
    next,
    prev,
    today,
    setDate: setCurrentDate,
    refetch: fetchCalendar,
    monthDays,
    weekDays,
  };
}
