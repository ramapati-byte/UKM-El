// hooks/usePermission.ts — Hook cek permission

"use client";

import { useCallback } from "react";
import { can, type Permission, type UserRole } from "../lib/permissions";

export function usePermission(role: UserRole) {
  const canAccess = useCallback(
    (permission: Permission, ukmId?: string) => {
      return can(permission, { role, ukm_id: ukmId });
    },
    [role]
  );

  return { can: canAccess };
}