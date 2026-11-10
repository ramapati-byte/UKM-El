// components/events/RoomSelect.tsx — Dropdown pemilihan ruangan kegiatan

"use client";

import React, { useEffect, useState } from "react";
import Select from "../ui/Select";
import type { Room } from "../../types/event";
import { eventService } from "../../services/event.service";

interface RoomSelectProps {
  value: string;
  onChange: (roomId: string, roomName?: string) => void;
  required?: boolean;
  error?: string;
  className?: string;
}

export default function RoomSelect({
  value,
  onChange,
  required = false,
  error,
  className = "",
}: RoomSelectProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    eventService
      .getRooms()
      .then((data) => {
        if (isMounted) setRooms(data);
      })
      .catch(() => {
        if (isMounted) setRooms([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const options = [
    { value: "", label: "-- Pilih Ruangan Kampus --" },
    ...rooms.map((r) => ({
      value: r.id,
      label: `${r.name} (${r.location || "Kampus"}${
        r.capacity ? ` • Kapasitas ${r.capacity}` : ""
      })`,
    })),
    { value: "custom", label: "Lokasi Lainnya / Luar Kampus" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const room = rooms.find((r) => r.id === selectedId);
    onChange(selectedId, room?.name);
  };

  return (
    <Select
      label="Ruangan / Fasilitas Kampus"
      options={options}
      value={value}
      onChange={handleChange}
      required={required}
      error={error}
      disabled={loading}
      helper={
        loading
          ? "Memuat daftar ruangan..."
          : "Sistem mendeteksi jadwal ketersediaan ruangan ini secara otomatis."
      }
      className={className}
    />
  );
}
