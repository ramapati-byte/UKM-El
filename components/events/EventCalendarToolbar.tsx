// components/events/EventCalendarToolbar.tsx — Toolbar kontrol kalender (bulan, minggu, filter UKM)

"use client";

import React from "react";
import Button from "../ui/Button";
import Link from "next/link";
import { formatMonthYear } from "../../lib/date";
import type { CalendarViewMode } from "../../hooks/useEventCalendar";

interface EventCalendarToolbarProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onNext: () => void;
  onPrev: () => void;
  onToday: () => void;
  selectedUkm: string;
  onUkmChange: (ukmId: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

const UKM_OPTIONS = [
  { value: "", label: "Semua UKM" },
  { value: "ukm-bem", label: "BEM El Rahma" },
  { value: "ukm-robotik", label: "UKM Robotik & Otomasi" },
  { value: "ukm-tari", label: "UKM Seni Tradisional" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "approved", label: "Disetujui" },
  { value: "pending", label: "Menunggu" },
  { value: "draft", label: "Draft" },
];

export default function EventCalendarToolbar({
  currentDate,
  viewMode,
  onViewModeChange,
  onNext,
  onPrev,
  onToday,
  selectedUkm,
  onUkmChange,
  selectedStatus,
  onStatusChange,
}: EventCalendarToolbarProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
      {/* Sisi Kiri: Navigasi & Judul Bulan */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="font-bold"
        >
          Hari Ini
        </Button>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            icon="bi-chevron-left"
            onClick={onPrev}
            aria-label="Sebelumnya"
          />
          <Button
            variant="outline"
            size="sm"
            icon="bi-chevron-right"
            onClick={onNext}
            aria-label="Berikutnya"
          />
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 ml-1">
          {formatMonthYear(currentDate)}
        </h2>
      </div>

      {/* Sisi Kanan: Switcher Mode, Filter, & Tombol Buat */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Toggle Bulan / Minggu */}
        <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => onViewModeChange("month")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              viewMode === "month"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <i className="bi bi-calendar3" aria-hidden="true" />
            <span>Bulan</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("week")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              viewMode === "week"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <i className="bi bi-calendar-week" aria-hidden="true" />
            <span>Minggu</span>
          </button>
        </div>

        {/* Filter UKM */}
        <select
          value={selectedUkm}
          onChange={(e) => onUkmChange(e.target.value)}
          className="text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        >
          {UKM_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Filter Status */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Tombol Buat Event Baru */}
        <Link href="/organizer/create-event">
          <Button
            variant="primary"
            size="sm"
            icon="bi-plus-lg"
            className="font-bold shadow-xs"
          >
            Buat Event
          </Button>
        </Link>
      </div>
    </div>
  );
}
