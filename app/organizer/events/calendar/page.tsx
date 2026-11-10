// app/organizer/events/calendar/page.tsx — Halaman Kalender Kegiatan Terpadu

"use client";

import React from "react";
import Link from "next/link";
import AppShell from "@/components/shell/AppShell";
import EventCalendar from "@/components/events/EventCalendar";
import Button from "@/components/ui/Button";

export default function OrganizerCalendarPage() {
  return (
    <AppShell
      title="Kalender Terpadu"
      subtitle="Agenda kegiatan seluruh UKM dengan deteksi bentrok jadwal & ruangan"
      breadcrumbs={[
        { label: "Dashboard", href: "/organizer/dashboard" },
        { label: "Kelola Event", href: "/organizer/events" },
        { label: "Kalender" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Link href="/organizer/events">
            <Button variant="outline" size="sm" icon="bi-list-ul">
              Daftar Event
            </Button>
          </Link>
          <Link href="/organizer/create-event">
            <Button variant="primary" size="sm" icon="bi-plus-lg" className="font-bold">
              Buat Event
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        <EventCalendar />
      </div>
    </AppShell>
  );
}
