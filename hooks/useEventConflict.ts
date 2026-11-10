// hooks/useEventConflict.ts — Hook validasi bentrok jadwal & ruangan dengan debounce

"use client";

import { useState, useEffect } from "react";
import type { ConflictCheckRequest, ConflictCheckResult } from "../types/event";
import { eventService } from "../services/event.service";

interface UseEventConflictResult {
  checking: boolean;
  result: ConflictCheckResult;
  hasConflict: boolean;
  clear: () => void;
}

export function useEventConflict(
  req: Partial<ConflictCheckRequest> | null,
  debounceMs = 350
): UseEventConflictResult {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<ConflictCheckResult>({
    has_conflict: false,
    conflicts: [],
  });

  const startsAt = req?.starts_at;
  const endsAt = req?.ends_at;
  const roomId = req?.room_id;
  const ukmId = req?.ukm_id;
  const excludeEventId = req?.exclude_event_id;

  useEffect(() => {
    if (!startsAt || !ukmId) {
      setResult({ has_conflict: false, conflicts: [] });
      setChecking(false);
      return;
    }

    setChecking(true);
    const handler = setTimeout(async () => {
      try {
        const res = await eventService.checkConflict({
          starts_at: startsAt,
          ends_at: endsAt ?? null,
          room_id: roomId ?? null,
          ukm_id: ukmId,
          exclude_event_id: excludeEventId,
        });
        setResult(res);
      } catch {
        setResult({ has_conflict: false, conflicts: [] });
      } finally {
        setChecking(false);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [startsAt, endsAt, roomId, ukmId, excludeEventId, debounceMs]);

  const clear = () => {
    setResult({ has_conflict: false, conflicts: [] });
    setChecking(false);
  };

  return {
    checking,
    result,
    hasConflict: result.has_conflict,
    clear,
  };
}
