// components/events/EventStatCards.tsx — 4 StatCard metrik ringkasan event

import React from "react";
import StatCard from "../ui/StatCard";
import type { EventEntity } from "../../types/event";

interface EventStatCardsProps {
  event: EventEntity;
  attendeesCount?: number;
  committeesCount?: number;
  lpjStatus?: string;
  className?: string;
}

export default function EventStatCards({
  event,
  attendeesCount,
  committeesCount,
  lpjStatus,
  className = "",
}: EventStatCardsProps) {
  const registrants = event.counts?.registrants || 0;
  const attendees = attendeesCount !== undefined ? attendeesCount : (event.counts?.attendees || 0);
  const committees = committeesCount !== undefined ? committeesCount : (event.counts?.committees || 0);

  const quotaPercent =
    event.max_participants > 0
      ? Math.round((registrants / event.max_participants) * 100)
      : null;

  const attendanceRate =
    registrants > 0 ? Math.round((attendees / registrants) * 100) : 0;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* 1. Total Pendaftar */}
      <StatCard
        title="Total Pendaftar"
        value={registrants}
        icon="bi-people"
        variant="primary"
        subtitle={
          event.max_participants > 0
            ? `Kuota: ${event.max_participants} (${quotaPercent}%)`
            : "Kapasitas tanpa batas"
        }
        trend={
          quotaPercent !== null && quotaPercent >= 90
            ? { value: "Hampir Penuh", isUp: true }
            : undefined
        }
      />

      {/* 2. Kehadiran */}
      <StatCard
        title="Tingkat Hadir"
        value={`${attendanceRate}%`}
        icon="bi-qr-code-scan"
        variant="success"
        subtitle={`${attendees} dari ${registrants} peserta hadir`}
        trend={attendanceRate >= 75 ? { value: "Tinggi", isUp: true } : undefined}
      />

      {/* 3. Tim Panitia */}
      <StatCard
        title="Panitia Event"
        value={committees}
        icon="bi-person-badge"
        variant="info"
        subtitle="Divisi & pelaksana aktif"
      />

      {/* 4. Status LPJ & Laporan */}
      <StatCard
        title="Status LPJ"
        value={
          lpjStatus === "approved"
            ? "Disahkan"
            : lpjStatus === "submitted"
            ? "Diajukan"
            : "Draft"
        }
        icon="bi-file-earmark-check"
        variant={
          lpjStatus === "approved"
            ? "success"
            : lpjStatus === "submitted"
            ? "info"
            : "warning"
        }
        subtitle={
          event.status === "completed"
            ? "Wajib dilaporkan"
            : `Event: ${event.status}`
        }
      />
    </div>
  );
}
