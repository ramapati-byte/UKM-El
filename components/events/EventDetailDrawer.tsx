// components/events/EventDetailDrawer.tsx — Modal drawer detail event saat item kalender diklik

"use client";

import React from "react";
import Link from "next/link";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import EventStatusBadge from "./EventStatusBadge";
import type { CalendarEvent } from "../../types/event";
import { formatDateLong, formatTime } from "../../lib/format";

interface EventDetailDrawerProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

export default function EventDetailDrawer({
  event,
  onClose,
}: EventDetailDrawerProps) {
  if (!event) return null;

  return (
    <Modal
      open={Boolean(event)}
      onClose={onClose}
      title="Detail Agenda Kegiatan"
      size="md"
      footer={
        <div className="flex flex-wrap items-center justify-between w-full gap-2">
          <Link href={`/organizer/events/edit/${btoa(String(event.id))}`}>
            <Button variant="outline" size="sm" icon="bi-pencil">
              Edit Event
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Link href={`/organizer/pendaftar`}>
              <Button variant="outline" size="sm" icon="bi-people">
                Pendaftar
              </Button>
            </Link>
            <Button variant="primary" size="sm" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Header: UKM & Status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <i className="bi bi-building" aria-hidden="true" />
            {event.ukm_name}
          </span>
          <EventStatusBadge status={event.status} size="sm" />
        </div>

        {/* Judul Event */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
          {event.title}
        </h3>

        {/* Informasi Utama */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-2.5">
            <i className="bi bi-calendar-check text-indigo-500 text-sm mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {formatDateLong(event.starts_at)}
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                {formatTime(event.starts_at)}
                {event.ends_at && ` - ${formatTime(event.ends_at)}`}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <i className="bi bi-geo-alt text-red-500 text-sm mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {event.room_name || "Lokasi Kampus"}
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                {event.room_id ? "Ruangan Terverifikasi Sistem" : "Lokasi Bebas"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <i className="bi bi-info-circle text-sky-500 text-sm mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                ID Event #{event.id}
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Agenda tersinkronisasi lintas kalender UKM
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
