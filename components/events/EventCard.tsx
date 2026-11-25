// components/events/EventCard.tsx — Modern Event Card with Sunrise Hover Energy

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
      className={`group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs card-hover-sunrise flex flex-col h-full ${className}`}
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
          <div className="w-full h-full bg-gradient-to-br from-amber-500/20 via-rose-500/30 to-indigo-700/40 dark:from-amber-950/40 dark:via-rose-950/50 dark:to-indigo-950/60 flex flex-col items-center justify-center text-slate-700 dark:text-white/60 p-4">
            <i className="bi bi-calendar-event text-5xl mb-2 text-rose-500/80 group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
            <span className="text-xs font-bold tracking-wider uppercase opacity-75">
              {event.ukm_name || "Event Kampus"}
            </span>
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="secondary" size="sm" className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs font-bold uppercase tracking-wider text-[10px] shadow-2xs">
            {event.visibility === "public" ? (
              <>
                <i className="bi bi-globe2 mr-1 text-sky-500" aria-hidden="true" /> Publik
              </>
            ) : (
              <>
                <i className="bi bi-lock-fill mr-1 text-amber-500" aria-hidden="true" /> Internal
              </>
            )}
          </Badge>
        </div>

        <div className="absolute top-3 right-3 z-10">
          <span
            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md shadow-xs ${
              isFree
                ? "bg-emerald-500/90 text-white"
                : "bg-gradient-to-r from-amber-500 to-rose-500 text-white"
            }`}
          >
            {isFree ? "Gratis" : formatRupiah(event.price)}
          </span>
        </div>

        {/* Bottom Banner inside Poster */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-white text-xs">
          <span className="font-semibold text-rose-200 truncate flex items-center gap-1.5">
            <i className="bi bi-building text-[11px]" />
            {event.ukm_name || "BEM El Rahma"}
          </span>
          <span className="text-[11px] font-medium text-white/80 shrink-0 capitalize">
            {event.type}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
            {event.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {event.description || "Tidak ada deskripsi detail kegiatan."}
          </p>
        </div>

        {/* Metadata Details */}
        <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <i className="bi bi-calendar3 text-rose-500 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {formatDateShort(event.starts_at)} &bull; {formatTime(event.starts_at)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <i className="bi bi-geo-alt text-amber-500 shrink-0" aria-hidden="true" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="pt-2">
          <Link
            href={`/events/${event.id}`}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-50 hover:bg-gradient-to-r hover:from-amber-500 hover:via-rose-500 hover:to-indigo-600 text-slate-700 hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:hover:text-white border border-slate-200/80 dark:border-slate-700 hover:border-transparent transition-all duration-200 active:scale-95 shadow-2xs group/btn"
          >
            <span>Lihat Detail Kegiatan</span>
            <i className="bi bi-arrow-right text-xs transition-transform duration-200 group-hover/btn:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
