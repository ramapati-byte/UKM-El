// app/events/[id]/page.tsx — Halaman Publik Detail Agenda & Pendaftaran Event

import type { Metadata } from "next";
import EventDetailClient from "./EventDetailClient";
import { eventService } from "@/services/event.service";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const eventId = Number(id);

  if (!eventId || isNaN(eventId)) {
    return {
      title: "Event Tidak Ditemukan — BEM El Rahma",
    };
  }

  try {
    const event = await eventService.getPublicEventById(eventId);
    if (!event) {
      return {
        title: "Event Tidak Ditemukan — BEM El Rahma",
      };
    }

    return {
      title: `${event.title} — BEM El Rahma`,
      description: event.description.substring(0, 160),
      openGraph: {
        title: `${event.title} — BEM El Rahma`,
        description: event.description.substring(0, 160),
        type: "article",
        publishedTime: event.starts_at,
        authors: [event.ukm_name || "BEM El Rahma"],
      },
    };
  } catch {
    return {
      title: "Detail Event — BEM El Rahma",
    };
  }
}

export default function EventDetailPage() {
  return <EventDetailClient />;
}
