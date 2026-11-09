import { BadgeCheck, Clock, ShieldAlert } from "lucide-react";

type VerificationStatus = "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED" | string;

type BadgeConfig = { className: string; icon: typeof BadgeCheck; label: string };

const badgeConfig = {
  PENDING: {
    className: "bg-amber-50 text-amber-800 ring-amber-200",
    icon: Clock,
    label: "Verificação em análise",
  },
  REJECTED: {
    className: "bg-rose-50 text-rose-800 ring-rose-200",
    icon: ShieldAlert,
    label: "Verificação não aprovada",
  },
  SUSPENDED: {
    className: "bg-rose-50 text-rose-800 ring-rose-200",
    icon: ShieldAlert,
    label: "Perfil suspenso",
  },
  UNVERIFIED: {
    className: "bg-slate-100 text-slate-600 ring-slate-200",
    icon: ShieldAlert,
    label: "Ainda não verificado",
  },
  VERIFIED: {
    className: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    icon: BadgeCheck,
    label: "CRBio verificado",
  },
} satisfies Record<string, BadgeConfig>;

function getBadgeConfig(status: VerificationStatus): BadgeConfig {
  return status in badgeConfig
    ? badgeConfig[status as keyof typeof badgeConfig]
    : badgeConfig.UNVERIFIED;
}

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const config = getBadgeConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${config.className}`}
    >
      <Icon size={14} aria-hidden="true" />
      {config.label}
    </span>
  );
}
