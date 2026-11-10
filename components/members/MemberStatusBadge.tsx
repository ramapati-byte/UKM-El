// components/members/MemberStatusBadge.tsx

import Badge from "../ui/Badge";
import type { MemberStatus } from "../../types/member";
import type { BadgeVariant } from "../../types/common";

const STATUS_MAP: Record<MemberStatus, { label: string; variant: BadgeVariant }> = {
  aktif:    { label: "Aktif",    variant: "success"   },
  nonaktif: { label: "Nonaktif", variant: "secondary" },
  alumni:   { label: "Alumni",   variant: "info"      },
  pending:  { label: "Menunggu", variant: "warning"   },
};

export default function MemberStatusBadge({ status }: { status: MemberStatus }) {
  const { label, variant } = STATUS_MAP[status] ?? { label: status, variant: "secondary" as BadgeVariant };
  return <Badge variant={variant} dot>{label}</Badge>;
}
