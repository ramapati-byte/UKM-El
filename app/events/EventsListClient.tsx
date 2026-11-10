// app/events/EventsListClient.tsx — Komponen client katalog event publik

"use client";

import { useState, useEffect, useMemo } from "react";
import PublicShell from "@/components/shell/PublicShell";
import EventPublicHeader, {
  type EventPublicFilterState,
} from "@/components/events/EventPublicHeader";
import EventCard from "@/components/events/EventCard";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { eventService } from "@/services/event.service";
import type { EventEntity } from "@/types/event";

export default function EventsListClient() {
  const [events, setEvents] = useState<EventEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<EventPublicFilterState>({
    search: "",
    ukm: "",
    type: "",
  });

  const handleUpdateFilter = (updated: Partial<EventPublicFilterState>) => {
    setFilter((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilter = () => {
    setFilter({ search: "", ukm: "", type: "" });
  };

  const fetchPublicEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await eventService.getPublicEvents();
      setEvents(list);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat agenda event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicEvents();
  }, []);

  // Filter di sisi client untuk responsiveness cepat
  const filteredEvents = useMemo(() => {
    let result = [...events];

    if (filter.search.trim()) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          (e.ukm_name && e.ukm_name.toLowerCase().includes(q))
      );
    }

    if (filter.ukm) {
      result = result.filter((e) => e.ukm_id === filter.ukm);
    }

    if (filter.type) {
      result = result.filter((e) => e.type === filter.type);
    }

    return result;
  }, [events, filter]);

  return (
    <PublicShell>
      <div className="space-y-10 pb-20">
        {/* Header Hero Section */}
        <EventPublicHeader
          filter={filter}
          onChangeFilter={handleUpdateFilter}
          totalEvents={filteredEvents.length}
        />

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="space-y-4">
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              <LoadingSkeleton variant="card" count={6} />
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/50 p-6 max-w-lg mx-auto">
              <i className="bi bi-exclamation-triangle text-3xl text-red-500 mb-2 block" aria-hidden="true" />
              <h3 className="font-bold text-base text-red-900 dark:text-red-200 mb-1">
                Gagal Memuat Event
              </h3>
              <p className="text-xs text-red-700 dark:text-red-300 mb-4">{error}</p>
              <Button size="sm" variant="outline" icon="bi-arrow-clockwise" onClick={fetchPublicEvents}>
                Coba Lagi
              </Button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <EmptyState
              icon="bi-search"
              title="Tidak Ada Event Ditemukan"
              message={
                filter.search || filter.ukm || filter.type
                  ? "Tidak ada kegiatan yang cocok dengan kriteria filter Anda. Coba reset filter atau gunakan kata kunci lain."
                  : "Belum ada agenda kegiatan publik yang dipublikasikan saat ini."
              }
              action={
                filter.search || filter.ukm || filter.type ? (
                  <Button
                    size="sm"
                    variant="outline"
                    icon="bi-x-circle"
                    onClick={handleResetFilter}
                  >
                    Reset Filter
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredEvents.map((ev) => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
