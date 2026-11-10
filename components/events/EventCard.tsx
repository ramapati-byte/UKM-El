// components/events/EventCard.tsx — Kartu event publik berstandar AdminLTE 4

import React from "react";
import Link from "next/link";
import Badge from "../ui/Badge";
import type { EventEntity } from "../../types/event";
import { formatRupiah, formatDateShort, formatTime } from "../../lib/format";
import { getBackendBaseUrl } from "../../lib/env";

export interface EventCardProps {
  event: EventEntity;
  className?: string;
}

export default function EventCard({ event, className = "" }: EventCardProps) {
  const isFree = event.type === "free" || event.price <= 0;
  const posterSrc = event.poster_url
    ? event.poster_url.startsWith("http")
      ? event.poster_url
      : `${getBackendBaseUrl()}${event.poster_url.startsWith("/") ? "" : "/"}${event.poster_url}`
    : null;

  return (
    <article
      className={`group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1 ${className}`}
    >
      {/* Poster Media Header */}
      <div className="h-48 sm:h-52 bg-slate-100 dark:bg-slate-800 relative overflow-hidden shrink-0">
        {posterSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterSrc}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-700 via-slate-800 to-indigo-950 flex flex-col items-center justify-center text-white/50 p-4">
            <i className="bi bi-calendar-event text-5xl mb-2 opacity-40 group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-wider uppercase opacity-60">
              {event.ukm_name || "Event Kampus"}
            </span>
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="secondary" size="sm" className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs font-bold uppercase tracking-wider text-[10px]">
            {event.visibility === "public" ? (
              <>
                <i className="bi bi-globe2 mr-1" aria-hidden="true" /> Publik
              </>
            ) : (
              <>
                <i className="bi bi-lock-fill mr-1" aria-hidden="true" /> Internal
              </>
            )}
          </Badge>
        </div>

        <div className="absolute top-3 right-3 z-10">
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-md backdrop-blur-xs ${
              isFree
                ? "bg-emerald-500 text-white"
                : "bg-amber-400 text-amber-950"
            }`}
          >
            {isFree ? "GRATIS" : formatRupiah(event.price)}
          </span>
        </div>

        {/* Bottom Banner Info on Image */}
        <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-medium flex items-center justify-between">
          <span className="flex items-center gap-1.5 drop-shadow-sm truncate">
            <i className="bi bi-calendar3 text-amber-400" aria-hidden="true" />
            <span>{formatDateShort(event.starts_at)} • {formatTime(event.starts_at)}</span>
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* UKM Organizer Label */}
        <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <i className="bi bi-building" aria-hidden="true" />
          <span className="truncate">{event.ukm_name || "BEM El Rahma"}</span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg leading-snug mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          <Link href={`/events/${event.id}`}>
            {event.title}
          </Link>
        </h3>

        {/* Location & Capacity Info */}
        <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <div className="flex items-center gap-1.5 truncate">
            <i className="bi bi-geo-alt text-indigo-500 shrink-0" aria-hidden="true" />
            <span className="truncate">{event.location}</span>
          </div>
          {event.max_participants > 0 && (
            <div className="flex items-center gap-1.5 truncate">
              <i className="bi bi-people text-amber-500 shrink-0" aria-hidden="true" />
              <span>Kuota: {event.max_participants} peserta</span>
            </div>
          )}
        </div>

        {/* Description Snippet */}
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
          {event.description}
        </p>

        {/* Footer CTA */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <i className="bi bi-clock-history" aria-hidden="true" />
            <span>ID #{event.id}</span>
          </span>
          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs group-hover:shadow-md"
          >
            <span>Detail & Daftar</span>
            <i className="bi bi-arrow-right text-xs transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
