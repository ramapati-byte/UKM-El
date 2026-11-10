// components/events/EventCalendar.tsx — Komponen Kalender Terpadu Utama

"use client";

import React, { useState } from "react";
import EventCalendarToolbar from "./EventCalendarToolbar";
import EventCalendarMonth from "./EventCalendarMonth";
import EventCalendarWeek from "./EventCalendarWeek";
import EventDetailDrawer from "./EventDetailDrawer";
import LoadingSkeleton from "../ui/LoadingSkeleton";
import ErrorState from "../ui/ErrorState";
import { useEventCalendar } from "../../hooks/useEventCalendar";
import type { CalendarEvent } from "../../types/event";
import { formatDateLong } from "../../lib/format";

export default function EventCalendar() {
  const {
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
    refetch,
    monthDays,
    weekDays,
  } = useEventCalendar();

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<{
    date: Date;
    events: CalendarEvent[];
  } | null>(null);

  // Filter status di sisi client
  const filteredEvents = selectedStatus
    ? events.filter((e) => e.status === selectedStatus)
    : events;

  const handleSelectDate = (date: Date) => {
    // Pada mobile / klik tanggal: tampilkan list event pada hari tersebut
    const dayEvents = filteredEvents.filter((e) => {
      const evDate = new Date(e.starts_at);
      return (
        evDate.getFullYear() === date.getFullYear() &&
        evDate.getMonth() === date.getMonth() &&
        evDate.getDate() === date.getDate()
      );
    });
    setSelectedDayEvents({ date, events: dayEvents });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar Kontrol Kalender */}
      <EventCalendarToolbar
        currentDate={currentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNext={next}
        onPrev={prev}
        onToday={today}
        selectedUkm={selectedUkm}
        onUkmChange={setSelectedUkm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* Area Tampilan Kalender */}
      {loading ? (
        <LoadingSkeleton variant="calendar" />
      ) : error ? (
        <ErrorState
          title="Gagal Memuat Kalender"
          message={error}
          onRetry={refetch}
        />
      ) : (
        <>
          {viewMode === "month" ? (
            <EventCalendarMonth
              currentDate={currentDate}
              monthDays={monthDays}
              events={filteredEvents}
              onSelectEvent={setActiveEvent}
              onSelectDate={handleSelectDate}
            />
          ) : (
            <EventCalendarWeek
              weekDays={weekDays}
              events={filteredEvents}
              onSelectEvent={setActiveEvent}
            />
          )}

          {/* Legenda Warna Status Kalender */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Legenda Status:
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Disetujui</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span>Menunggu Review</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Draft</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>Selesai</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-400 italic">
              *Klik pada nama event untuk melihat ringkasan
            </span>
          </div>
        </>
      )}

      {/* Modal Detail Event */}
      <EventDetailDrawer
        event={activeEvent}
        onClose={() => setActiveEvent(null)}
      />

      {/* Modal Daftar Event per Hari (Saat klik tanggal di mobile / kosong) */}
      {selectedDayEvents && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Agenda Tanggal
                </p>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {formatDateLong(selectedDayEvents.date)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayEvents(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <i className="bi bi-x-lg" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {selectedDayEvents.events.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  Tidak ada agenda kegiatan pada tanggal ini.
                </p>
              ) : (
                selectedDayEvents.events.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => {
                      setSelectedDayEvents(null);
                      setActiveEvent(ev);
                    }}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 cursor-pointer transition bg-slate-50 dark:bg-slate-800/60"
                  >
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                      {ev.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                      <span>{ev.ukm_name}</span>
                      <span>•</span>
                      <span>{ev.room_name || "Kampus"}</span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
