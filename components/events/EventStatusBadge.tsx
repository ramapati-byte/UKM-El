// components/events/EventStatusBadge.tsx — Badge status event dengan token warna AdminLTE 4

import React from "react";
import Badge from "../ui/Badge";
import type { EventStatus } from "../../types/event";
import { EVENT_STATUS_MAP } from "../../types/event";

interface EventStatusBadgeProps {
  status: EventStatus;
  size?: "sm" | "md";
  className?: string;
}

export default function EventStatusBadge({
  status,
  size = "md",
  className = "",
}: EventStatusBadgeProps) {
  const meta = EVENT_STATUS_MAP[status] || {
    label: status,
    variant: "secondary" as const,
  };

  return (
    <Badge variant={meta.variant} dot size={size} className={className}>
      {meta.label}
    </Badge>
  );
}
