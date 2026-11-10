// components/events/EventCalendarMonth.tsx — Tampilan grid kalender bulanan

"use client";

import React from "react";
import type { CalendarEvent } from "../../types/event";
import {
  DAY_NAMES_SHORT,
  isToday,
  isSameMonth,
  isSameDay,
} from "../../lib/date";

interface EventCalendarMonthProps {
  currentDate: Date;
  monthDays: Date[][];
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDate: (date: Date) => void;
}

const COLOR_MAP: Record<CalendarEvent["color_token"], { bg: string; text: string; border: string }> = {
  primary: {
    bg: "bg-indigo-50 dark:bg-indigo-950/70",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-800",
  },
  success: {
    bg: "bg-emerald-50 dark:bg-emerald-950/70",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  info: {
    bg: "bg-sky-50 dark:bg-sky-950/70",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-800",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/70",
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
  },
  danger: {
    bg: "bg-red-50 dark:bg-red-950/70",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800",
  },
  secondary: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
  },
};

export default function EventCalendarMonth({
  currentDate,
  monthDays,
  events,
  onSelectEvent,
  onSelectDate,
}: EventCalendarMonthProps) {
  // Ambil event yang jatuh pada tanggal tertentu
  const getEventsForDay = (date: Date): CalendarEvent[] => {
    return events.filter((e) => isSameDay(new Date(e.starts_at), date));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
      {/* Header Nama Hari (Sen - Min) */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
        {DAY_NAMES_SHORT.map((name, idx) => (
          <div
            key={idx}
            className="py-2.5 text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Grid 6 Minggu x 7 Hari */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/80">
        {monthDays.flat().map((day, idx) => {
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);
          const dayEvents = getEventsForDay(day);
          const maxVisible = 3;
          const visibleEvents = dayEvents.slice(0, maxVisible);
          const overflowCount = dayEvents.length - maxVisible;

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(day)}
              className={`min-h-[95px] sm:min-h-[110px] p-1.5 sm:p-2 transition-colors cursor-pointer group flex flex-col ${
                inMonth
                  ? "bg-white dark:bg-slate-900 hover:bg-indigo-50/30 dark:hover:bg-slate-800/50"
                  : "bg-slate-50/60 dark:bg-slate-950/40 opacity-50"
              }`}
            >
              {/* Header Tanggal */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full transition-transform group-hover:scale-105 ${
                    today
                      ? "bg-indigo-600 text-white shadow-xs"
                      : inMonth
                      ? "text-slate-700 dark:text-slate-200"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {day.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <span className="sm:hidden text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {/* List Event Badge (Desktop) */}
              <div className="space-y-1 flex-1 hidden sm:block">
                {visibleEvents.map((ev) => {
                  const colors = COLOR_MAP[ev.color_token] || COLOR_MAP.primary;
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(ev);
                      }}
                      className={`w-full text-left px-1.5 py-0.5 rounded text-[11px] font-semibold border truncate transition-all hover:scale-[1.02] flex items-center gap-1 ${colors.bg} ${colors.text} ${colors.border}`}
                      title={`${ev.title} (${ev.ukm_name})`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                      <span className="truncate">{ev.title}</span>
                    </button>
                  );
                })}

                {overflowCount > 0 && (
                  <span className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 px-1 pt-0.5">
                    +{overflowCount} lainnya
                  </span>
                )}
              </div>

              {/* Indikator Titik Event (Mobile) */}
              <div className="flex sm:hidden items-center justify-center gap-1 mt-auto pt-1">
                {dayEvents.slice(0, 3).map((ev) => (
                  <span
                    key={ev.id}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
