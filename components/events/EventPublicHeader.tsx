// components/events/EventPublicHeader.tsx — Header/Hero publik untuk katalog event

"use client";

import React from "react";
import Input from "../ui/Input";

export interface EventPublicFilterState {
  search: string;
  ukm: string;
  type: string;
}

interface EventPublicHeaderProps {
  filter: EventPublicFilterState;
  onChangeFilter: (f: Partial<EventPublicFilterState>) => void;
  totalEvents?: number;
}

const UKM_OPTIONS = [
  { value: "", label: "Semua UKM" },
  { value: "ukm-bem", label: "BEM El Rahma" },
  { value: "ukm-robotik", label: "UKM Robotik & Otomasi" },
  { value: "ukm-tari", label: "UKM Seni Tradisional" },
];

const TYPE_OPTIONS = [
  { value: "", label: "Semua Tipe" },
  { value: "free", label: "Gratis (Free)" },
  { value: "paid", label: "Berbayar (Paid)" },
];

export default function EventPublicHeader({
  filter,
  onChangeFilter,
  totalEvents,
}: EventPublicHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 -mt-6 rounded-b-[2.5rem] shadow-xl">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-700/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 text-center space-y-4">
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-indigo-200 text-xs font-bold uppercase tracking-widest">
          <i className="bi bi-calendar3-event text-amber-400" aria-hidden="true" />
          <span>Agenda & Kegiatan Kampus</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
          Jelajahi <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400">Event Seru</span> Kampus
        </h1>

        <p className="text-sm sm:text-base text-indigo-100/80 max-w-2xl mx-auto leading-relaxed">
          Temukan berbagai workshop, seminar, kompetisi, dan kegiatan inspiratif dari seluruh Unit Kegiatan Mahasiswa (UKM).
        </p>

        {/* Search & Filter Bar Box */}
        <div className="pt-4 max-w-3xl mx-auto">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-2xl border border-white/20 text-slate-800 dark:text-slate-100 flex flex-col sm:flex-row gap-3 items-center">
            {/* Input Search */}
            <div className="w-full sm:flex-1">
              <Input
                placeholder="Cari judul event, pembicara, atau topik..."
                icon="bi-search"
                value={filter.search}
                onChange={(e) => onChangeFilter({ search: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
              />
            </div>

            {/* Filter UKM */}
            <div className="w-full sm:w-48">
              <select
                value={filter.ukm}
                onChange={(e) => onChangeFilter({ ukm: e.target.value })}
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                {UKM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Tipe */}
            <div className="w-full sm:w-40">
              <select
                value={filter.type}
                onChange={(e) => onChangeFilter({ type: e.target.value })}
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Counter */}
          {totalEvents !== undefined && (
            <p className="text-xs text-indigo-200/80 text-left sm:text-center mt-3 font-medium">
              Menemukan <span className="font-bold text-white">{totalEvents}</span> kegiatan publik yang tersedia
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
