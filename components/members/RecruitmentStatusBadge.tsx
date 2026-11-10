// components/members/RecruitmentStatusBadge.tsx

import Badge from "../ui/Badge";
import type { RecruitmentFormStatus, ApplicantStatus } from "../../types/member";
import type { BadgeVariant } from "../../types/common";

const FORM_STATUS_MAP: Record<RecruitmentFormStatus, { label: string; variant: BadgeVariant }> = {
  draft:  { label: "Draft",  variant: "secondary" },
  open:   { label: "Dibuka", variant: "success"   },
  closed: { label: "Ditutup", variant: "danger"   },
};

const APPLICANT_STATUS_MAP: Record<ApplicantStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: "Menunggu", variant: "warning"   },
  lolos:   { label: "Lolos",    variant: "success"   },
  gugur:   { label: "Gugur",    variant: "danger"    },
};

export function RecruitmentFormStatusBadge({ status }: { status: RecruitmentFormStatus }) {
  const { label, variant } = FORM_STATUS_MAP[status] ?? { label: status, variant: "secondary" as BadgeVariant };
  return <Badge variant={variant} dot>{label}</Badge>;
}

export function ApplicantStatusBadge({ status }: { status: ApplicantStatus }) {
  const { label, variant } = APPLICANT_STATUS_MAP[status] ?? { label: status, variant: "secondary" as BadgeVariant };
  return <Badge variant={variant} dot>{label}</Badge>;
}
