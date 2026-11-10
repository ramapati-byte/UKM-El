// lib/permissions.ts — Permission map untuk aksi event
// Thin foundation; akan diperluas saat FE-1 (RBAC penuh).

export type EventPermission =
  | "event.view"
  | "event.create"
  | "event.edit"
  | "event.delete"
  | "event.approve"
  | "event.reject"
  | "event.calendar.view_all"
  | "event.committee.manage"
  | "event.lpj.submit"
  | "event.lpj.review"
  | "event.certificate.manage"
  | "event.attendance.scan"
  | "event.finance.view";

// UKM permissions
export type UkmPermission =
  | "ukm.view"
  | "ukm.create"
  | "ukm.edit"
  | "ukm.verify"
  | "ukm.delete";

// Letter permissions
export type LetterPermission =
  | "letter.view"
  | "letter.create"
  | "letter.edit"
  | "letter.delete";

// Finance permissions
export type FinancePermission =
  | "finance.view"
  | "finance.create"
  | "finance.approve"
  | "finance.delete";

// Inventory permissions
export type InventoryPermission =
  | "inventory.view"
  | "inventory.create"
  | "inventory.edit"
  | "inventory.delete"
  | "loan.view"
  | "loan.create"
  | "loan.approve"
  | "loan.delete";

// Program permissions
export type ProgramPermission =
  | "program.view"
  | "program.create"
  | "program.edit"
  | "program.delete"
  | "ranking.view";

// Document permissions
export type DocumentPermission =
  | "document.view"
  | "document.create"
  | "document.edit"
  | "document.delete";

// Announcement permissions
export type AnnouncementPermission =
  | "announcement.view"
  | "announcement.create"
  | "announcement.edit"
  | "announcement.delete";

// Role & Audit permissions
export type AdminPermission =
  | "role.view"
  | "audit.view";

// All permissions union
export type Permission =
  | EventPermission
  | UkmPermission
  | LetterPermission
  | FinancePermission
  | InventoryPermission
  | ProgramPermission
  | DocumentPermission
  | AnnouncementPermission
  | AdminPermission;

export type UserRole =
  | "superadmin"
  | "penyelenggara"
  | "mahasiswa";

/** Context yang diteruskan ke fungsi can() */
export interface PermissionContext {
  role: UserRole;
  user_id?: number;
  ukm_id?: string;
}

/** Mapping role → daftar permission yang diizinkan */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  superadmin: [
    // Event
    "event.view", "event.create", "event.edit", "event.delete", "event.approve", "event.reject",
    "event.calendar.view_all", "event.committee.manage", "event.lpj.submit", "event.lpj.review",
    "event.certificate.manage", "event.attendance.scan", "event.finance.view",
    // UKM
    "ukm.view", "ukm.create", "ukm.edit", "ukm.verify", "ukm.delete",
    // Letter
    "letter.view", "letter.create", "letter.edit", "letter.delete",
    // Finance
    "finance.view", "finance.create", "finance.approve", "finance.delete",
    // Inventory
    "inventory.view", "inventory.create", "inventory.edit", "inventory.delete",
    "loan.view", "loan.create", "loan.approve", "loan.delete",
    // Program
    "program.view", "program.create", "program.edit", "program.delete", "ranking.view",
    // Document
    "document.view", "document.create", "document.edit", "document.delete",
    // Announcement
    "announcement.view", "announcement.create", "announcement.edit", "announcement.delete",
    // Admin
    "role.view", "audit.view",
  ],
  penyelenggara: [
    // Event
    "event.view", "event.create", "event.edit", "event.delete",
    "event.committee.manage", "event.lpj.submit", "event.certificate.manage",
    "event.attendance.scan", "event.finance.view",
    // UKM (view only for own UKM)
    "ukm.view",
    // Letter
    "letter.view", "letter.create", "letter.edit",
    // Finance
    "finance.view", "finance.create",
    // Inventory
    "inventory.view", "inventory.create", "inventory.edit",
    "loan.view", "loan.create",
    // Program
    "program.view", "program.create", "program.edit",
    // Document
    "document.view", "document.create", "document.edit",
    // Announcement
    "announcement.view", "announcement.create", "announcement.edit",
  ],
  mahasiswa: [
    "event.view",
    "event.attendance.scan", // mahasiswa panitia bisa scan
  ],
};

/** Cek apakah role punya permission tertentu */
export function can(
  permission: Permission,
  ctx: PermissionContext
): boolean {
  const perms = ROLE_PERMISSIONS[ctx.role];
  if (!perms) return false;
  return perms.includes(permission);
}

/** Ambil semua permission untuk role */
export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}
