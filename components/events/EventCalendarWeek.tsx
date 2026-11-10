// components/events/EventCalendarWeek.tsx — Tampilan grid kalender mingguan berbaris jam

"use client";

import React from "react";
import type { CalendarEvent } from "../../types/event";
import {
  DAY_NAMES_SHORT,
  isToday,
  isSameDay,
  CALENDAR_HOURS,
} from "../../lib/date";
import { formatTime } from "../../lib/format";

interface EventCalendarWeekProps {
  weekDays: Date[];
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

const COLOR_MAP: Record<CalendarEvent["color_token"], { bg: string; text: string; border: string }> = {
  primary: {
    bg: "bg-indigo-100/90 dark:bg-indigo-950/80",
    text: "text-indigo-900 dark:text-indigo-200",
    border: "border-indigo-300 dark:border-indigo-700",
  },
  success: {
    bg: "bg-emerald-100/90 dark:bg-emerald-950/80",
    text: "text-emerald-900 dark:text-emerald-200",
    border: "border-emerald-300 dark:border-emerald-700",
  },
  info: {
    bg: "bg-sky-100/90 dark:bg-sky-950/80",
    text: "text-sky-900 dark:text-sky-200",
    border: "border-sky-300 dark:border-sky-700",
  },
  warning: {
    bg: "bg-amber-100/90 dark:bg-amber-950/80",
    text: "text-amber-900 dark:text-amber-200",
    border: "border-amber-300 dark:border-amber-700",
  },
  danger: {
    bg: "bg-red-100/90 dark:bg-red-950/80",
    text: "text-red-900 dark:text-red-200",
    border: "border-red-300 dark:border-red-700",
  },
  secondary: {
    bg: "bg-slate-200/90 dark:bg-slate-800",
    text: "text-slate-800 dark:text-slate-200",
    border: "border-slate-300 dark:border-slate-700",
  },
};

const HOUR_HEIGHT = 60; // Tinggi 1 jam = 60px
const START_HOUR = 6; // Dimulai jam 06:00

export default function EventCalendarWeek({
  weekDays,
  events,
  onSelectEvent,
}: EventCalendarWeekProps) {
  // Hitung posisi top dan tinggi event berdasarkan jam
  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.starts_at);
    const end = event.ends_at
      ? new Date(event.ends_at)
      : new Date(start.getTime() + 2 * 60 * 60 * 1000); // default 2 jam

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();

    const topMinutes = Math.max(0, startMinutes - START_HOUR * 60);
    const durationMinutes = Math.max(30, endMinutes - startMinutes);

    const top = (topMinutes / 60) * HOUR_HEIGHT;
    const height = Math.max(28, (durationMinutes / 60) * HOUR_HEIGHT - 2);

    return { top, height };
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          {/* Header Hari dalam Minggu */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 sticky top-0 z-10">
            <div className="p-3 text-center text-[10px] font-bold text-slate-400 uppercase">
              Waktu
            </div>
            {weekDays.map((day, idx) => {
              const today = isToday(day);
              return (
                <div
                  key={idx}
                  className={`p-3 text-center border-l border-slate-200 dark:border-slate-800 ${
                    today ? "bg-indigo-50/50 dark:bg-indigo-950/30" : ""
                  }`}
                >
                  <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                    {DAY_NAMES_SHORT[day.getDay() === 0 ? 6 : day.getDay() - 1]}
                  </p>
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 text-sm font-extrabold rounded-full mt-1 ${
                      today
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-800 dark:text-slate-100"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Grid Jam & Event Columns */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] relative">
            {/* Kolom Sumbu Waktu (Kiri) */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-right pr-2">
              {CALENDAR_HOURS.map((hour) => (
                <div
                  key={hour}
                  style={{ height: `${HOUR_HEIGHT}px` }}
                  className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 pt-1 select-none"
                >
                  {String(hour).padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {/* 7 Kolom Hari */}
            {weekDays.map((day, dayIdx) => {
              const dayEvents = events.filter((e) =>
                isSameDay(new Date(e.starts_at), day)
              );

              return (
                <div
                  key={dayIdx}
                  className="relative border-l border-slate-100 dark:divide-slate-800/60 border-slate-200 dark:border-slate-800"
                >
                  {/* Garis Horizontal Tiap Jam */}
                  {CALENDAR_HOURS.map((hour) => (
                    <div
                      key={hour}
                      style={{ height: `${HOUR_HEIGHT}px` }}
                      className="border-b border-slate-100 dark:border-slate-800/50"
                    />
                  ))}

                  {/* Blok Event yang Diposisikan Absolute */}
                  {dayEvents.map((ev) => {
                    const { top, height } = getEventPosition(ev);
                    const colors = COLOR_MAP[ev.color_token] || COLOR_MAP.primary;

                    return (
                      <div
                        key={ev.id}
                        onClick={() => onSelectEvent(ev)}
                        style={{ top: `${top}px`, height: `${height}px` }}
                        className={`absolute inset-x-1 p-1.5 rounded-lg border text-left cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md z-10 overflow-hidden flex flex-col justify-start ${colors.bg} ${colors.text} ${colors.border}`}
                      >
                        <p className="text-[11px] font-bold leading-tight truncate">
                          {ev.title}
                        </p>
                        <p className="text-[10px] opacity-80 truncate mt-0.5">
                          <i className="bi bi-clock mr-1" aria-hidden="true" />
                          {formatTime(ev.starts_at)}
                          {ev.room_name && ` • ${ev.room_name}`}
                        </p>
                        <p className="text-[9px] opacity-70 font-semibold uppercase tracking-wider truncate mt-auto">
                          {ev.ukm_name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
