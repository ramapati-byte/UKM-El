// app/events/page.tsx — Halaman Publik Daftar Event & Agenda Kampus

import type { Metadata } from "next";
import EventsListClient from "./EventsListClient";

export const metadata: Metadata = {
  title: "Katalog Agenda & Event Kampus — BEM El Rahma",
  description:
    "Jelajahi dan ikuti berbagai seminar, workshop, dan kompetisi bermanfaat dari seluruh Unit Kegiatan Mahasiswa (UKM) BEM El Rahma.",
  keywords: ["event kampus", "seminar", "workshop", "UKM", "BEM El Rahma", "kegiatan mahasiswa"],
  openGraph: {
    title: "Katalog Agenda & Event Kampus — BEM El Rahma",
    description: "Jelajahi berbagai agenda kegiatan dan kompetisi dari seluruh UKM kampus.",
    type: "website",
  },
};

export default function EventsPage() {
  return <EventsListClient />;
}
