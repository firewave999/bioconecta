"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Map,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { EmailVerificationNotice } from "@/components/auth/email-verification-notice";
import { Button } from "@/components/ui/button";
import { apiFetch, getStoredAccessToken } from "@/lib/api";

type DashboardState = {
  company: CompanySummary | null;
  certificationsCount: number;
  completion: number;
  documentsCount: number;
  email: string;
  emailVerifiedAt: string | null;
  experiencesCount: number;
  firstName: string;
  isAdmin: boolean;
  isBiologistAccount: boolean;
  isCompanyAccount: boolean;
  profileExists: boolean;
  professionalStarted: boolean;
  title: string;
};

type CompanySummary = {
  city: string;
  cnpj: string;
  logoUrl: string | null;
  name: string;
  state: string;
  verificationNotes: string | null;
  verificationStatus: string;
};

type CompanyJobSummary = {
  id: string;
  status: string;
  title: string;
};

export function DashboardClient() {
  const [state, setState] = useState<DashboardState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredAccessToken();

    if (!token) {
      setError("Voce precisa entrar para acessar o dashboard.");
      return;
    }

    apiFetch<{
      user: { email: string; emailVerifiedAt: string | null; firstName: string; roles: string[] };
    }>("/auth/me", { token })
      .then(async (me) => {
        const isCompanyAccount =
          me.user.roles.includes("COMPANY") || me.user.roles.includes("RECRUITER");
        const isBiologistAccount = me.user.roles.includes("BIOLOGIST");

        if (isCompanyAccount) {
          const [companyResponse, jobsResponse] = await Promise.all([
            apiFetch<{ company: CompanySummary | null }>("/companies/me", { token }),
            apiFetch<{ jobs: CompanyJobSummary[] }>("/jobs/mine", { token }).catch(() => ({
              jobs: [],
            })),
          ]);
          const publishedJobs = jobsResponse.jobs.filter((job) => job.status === "PUBLISHED");
          const draftJobs = jobsResponse.jobs.filter((job) => job.status === "DRAFT");
          const closedJobs = jobsResponse.jobs.filter((job) => job.status === "CLOSED");

          setState({
            company: companyResponse.company,
            certificationsCount: publishedJobs.length,
            completion: jobsResponse.jobs.length,
            documentsCount: closedJobs.length,
            email: me.user.email,
            emailVerifiedAt: me.user.emailVerifiedAt,
            experiencesCount: draftJobs.length,
            firstName: me.user.firstName,
            isAdmin: me.user.roles.includes("ADMIN"),
            isBiologistAccount,
            isCompanyAccount,
            profileExists: false,
            professionalStarted: false,
            title: companyResponse.company?.name ?? "Conta empresa",
          });
          return;
        }

        if (!isBiologistAccount) {
          setState({
            company: null,
            certificationsCount: 0,
            completion: 0,
            documentsCount: 0,
            email: me.user.email,
            emailVerifiedAt: me.user.emailVerifiedAt,
            experiencesCount: 0,
            firstName: me.user.firstName,
            isAdmin: me.user.roles.includes("ADMIN"),
            isBiologistAccount,
            isCompanyAccount,
            profileExists: false,
            professionalStarted: false,
            title: isCompanyAccount ? "Conta empresa" : "Conta estudante",
          });
          return;
        }

        const profile = await apiFetch<{
          completion: number;
          professional: {
            certifications: unknown[];
            documents: unknown[];
            experiences: unknown[];
            practiceAreas: unknown[];
            skills: unknown[];
            taxonomicGroups: unknown[];
          };
          profile: { headline?: string | null } | null;
        }>("/biologist-profile/me", { token });

        const professionalCount =
          profile.professional.practiceAreas.length +
          profile.professional.taxonomicGroups.length +
          profile.professional.skills.length +
          profile.professional.experiences.length +
          profile.professional.certifications.length +
          profile.professional.documents.length;

        setState({
          company: null,
          certificationsCount: profile.professional.certifications.length,
          completion: profile.completion,
          documentsCount: profile.professional.documents.length,
          email: me.user.email,
          emailVerifiedAt: me.user.emailVerifiedAt,
          experiencesCount: profile.professional.experiences.length,
          firstName: me.user.firstName,
          isAdmin: me.user.roles.includes("ADMIN"),
          isBiologistAccount,
          isCompanyAccount,
          profileExists: Boolean(profile.profile),
          professionalStarted: professionalCount > 0,
          title: profile.profile?.headline || "Perfil profissional em construcao",
        });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Nao foi possivel carregar o dashboard.");
      });
  }, []);

  if (error) {
    return (
      <div className="rounded-[8px] border border-red-200 bg-red-50 p-5 text-red-700">
        <p>{error}</p>
        <Button asChild className="mt-4">
          <Link href="/login">Ir para login</Link>
        </Button>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="grid gap-6">
        <div className="glass-panel h-72 animate-pulse rounded-[8px]" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="soft-card h-32 animate-pulse rounded-[8px]" />
          <div className="soft-card h-32 animate-pulse rounded-[8px]" />
          <div className="soft-card h-32 animate-pulse rounded-[8px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="glass-panel overflow-hidden rounded-[8px]">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                  <LayoutDashboard size={16} />
                  Dashboard
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                  Ola, {state.firstName}
                </h1>
                <p className="mt-3 max-w-2xl text-slate-600">{getDashboardSummary(state)}</p>
                <p className="mt-3 text-sm text-slate-500">{state.email}</p>
              </div>
              <LogoutButton />
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <QuickStatus
                label="Conta"
                value={state.emailVerifiedAt ? "Verificada" : "Pendente"}
              />
              <QuickStatus
                label={state.isCompanyAccount ? "Vagas" : "Perfil"}
                value={state.completion}
              />
              <QuickStatus label="Area" value={getAccountArea(state)} />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {getPrimaryAction(state)}
              <Button asChild variant="secondary">
                <Link href="/vagas">Explorar vagas</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/notificacoes">Notificacoes</Link>
              </Button>
            </div>
          </div>

          <div className="relative min-h-[320px] overflow-hidden bg-slate-950">
            <Image
              alt="Painel BioConecta com dados profissionais de biologia."
              className="object-cover opacity-78"
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              src={
                state.isCompanyAccount
                  ? "/images/company-hiring-premium.png"
                  : "/images/profile-field-premium.png"
              }
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.18),rgba(2,6,23,0.82))]" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                {state.isCompanyAccount ? "Operacao empresa" : "Perfil profissional"}
              </p>
              <p className="mt-2 text-xl font-semibold">{state.title}</p>
            </div>
          </div>
        </div>
      </section>

      {!state.emailVerifiedAt ? <EmailVerificationNotice email={state.email} /> : null}

      {state.isBiologistAccount ? (
        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard
            icon={<ClipboardCheck size={21} />}
            label="Conclusao do perfil"
            value={`${state.completion}%`}
          />
          <MetricCard
            icon={<BriefcaseBusiness size={21} />}
            label="Experiencias"
            value={state.experiencesCount}
          />
          <div className="soft-card rounded-[8px] p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-cyan-50 text-cyan-800">
              <UserRoundCheck size={21} />
            </div>
            <p className="mt-4 text-sm text-slate-500">Headline</p>
            <p className="mt-2 line-clamp-2 text-xl font-semibold text-slate-950">{state.title}</p>
          </div>
        </section>
      ) : null}

      {state.profileExists ? (
        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard
            icon={<BadgeCheck size={21} />}
            label="Certificacoes"
            value={state.certificationsCount}
          />
          <MetricCard
            icon={<FileText size={21} />}
            label="Documentos"
            value={state.documentsCount}
          />
          <MetricCard icon={<Map size={21} />} label="Status" value={getBiologistStage(state)} />
        </section>
      ) : null}

      {state.isBiologistAccount ? (
        <section className="soft-card rounded-[8px] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                {state.profileExists
                  ? state.professionalStarted
                    ? "Seu perfil profissional esta avancando."
                    : "Complete seu perfil profissional."
                  : "Complete seu onboarding."}
              </h2>
              <p className="mt-2 text-slate-600">
                Quanto mais completo o perfil, melhor a leitura de match nas vagas e mais confianca
                para a empresa entrar em contato.
              </p>
            </div>
            <span className="w-fit rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-800">
              {getBiologistStage(state)}
            </span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <ChecklistItem done={Boolean(state.emailVerifiedAt)} text="E-mail verificado" />
            <ChecklistItem done={state.profileExists} text="Dados basicos preenchidos" />
            <ChecklistItem done={state.professionalStarted} text="Especialidades e documentos" />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild>
              <Link href={state.profileExists ? "/perfil/editar" : "/onboarding/biologo"}>
                {state.profileExists ? "Editar perfil" : "Completar onboarding"}
              </Link>
            </Button>
            {state.profileExists ? (
              <Button asChild variant="secondary">
                <Link href="/perfil/profissional">Perfil profissional</Link>
              </Button>
            ) : null}
            <Button asChild variant="secondary">
              <Link href="/">Ver Home</Link>
            </Button>
          </div>
        </section>
      ) : null}

      {state.isCompanyAccount ? (
        <CompanyDashboardPanel state={state} />
      ) : !state.isBiologistAccount ? (
        <section className="soft-card rounded-[8px] p-6">
          <h2 className="text-xl font-semibold text-slate-950">Area do estudante</h2>
          <p className="mt-2 text-slate-600">
            Acompanhe vagas, favoritos e notificacoes. O perfil profissional completo sera tratado
            em uma etapa propria.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/vagas">Buscar vagas</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/favoritos">Favoritos</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/notificacoes">Notificacoes</Link>
            </Button>
          </div>
        </section>
      ) : (
        <section className="rounded-[8px] border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-950">Area do biologo</h2>
          <p className="mt-2 text-slate-600">
            Acompanhe vagas, candidaturas, favoritos e notificacoes da sua conta profissional.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/vagas">Buscar vagas</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/candidaturas">Minhas candidaturas</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/favoritos">Favoritos</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/notificacoes">Notificacoes</Link>
            </Button>
          </div>
        </section>
      )}

      {state.isAdmin ? (
        <section className="rounded-[8px] border border-cyan-200 bg-cyan-50/90 p-6 shadow-sm">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-cyan-800">
            <Sparkles size={16} />
            Administracao
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Painel admin separado</h2>
          <p className="mt-2 text-slate-600">
            Acesse a area operacional para validar empresas, biologos, vagas e auditoria.
          </p>
          <Button asChild className="mt-5">
            <Link href="/admin">Ir para painel admin</Link>
          </Button>
        </section>
      ) : null}
    </div>
  );
}

function CompanyDashboardPanel({ state }: { state: DashboardState }) {
  const company = state.company;

  return (
    <div className="grid gap-6">
      <section className="glass-panel rounded-[8px] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            {company?.logoUrl ? (
              <img
                alt={`Logo ${company.name}`}
                className="h-20 w-20 rounded-[8px] border border-slate-200 bg-white object-cover"
                src={company.logoUrl}
              />
            ) : null}
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                Painel da empresa
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                {company?.name ?? "Complete o cadastro da empresa"}
              </h2>
              <p className="mt-2 text-slate-600">
                {company
                  ? `${company.city}/${company.state} - CNPJ ${formatCnpj(company.cnpj)}`
                  : "Cadastre os dados juridicos antes de publicar vagas."}
              </p>
            </div>
          </div>
          <StatusBadge status={company?.verificationStatus ?? "PENDING_PROFILE"} />
        </div>
        {company?.verificationNotes ? (
          <p className="mt-4 rounded-[8px] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Observacao do admin: {company.verificationNotes}
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <MetricCard
            icon={<BriefcaseBusiness size={21} />}
            label="Total de vagas"
            value={state.completion}
          />
          <MetricCard
            icon={<BadgeCheck size={21} />}
            label="Publicadas"
            value={state.certificationsCount}
          />
          <MetricCard
            icon={<FileText size={21} />}
            label="Rascunhos"
            value={state.experiencesCount}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/empresa">{company ? "Editar empresa" : "Cadastrar empresa"}</Link>
          </Button>
          {company ? (
            <>
              <Button asChild variant="secondary">
                <Link href="/empresa/vagas">Gerenciar vagas</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/empresa/vagas/nova">Criar vaga</Link>
              </Button>
            </>
          ) : null}
        </div>
      </section>

      <section className="soft-card rounded-[8px] p-6">
        <h2 className="text-xl font-semibold text-slate-950">Proximas acoes</h2>
        <div className="mt-4 grid gap-3">
          <ChecklistItem done={Boolean(company)} text="Cadastrar dados da empresa" />
          <ChecklistItem
            done={company?.verificationStatus === "VERIFIED"}
            text="Aguardar verificacao pelo administrador"
          />
          <ChecklistItem done={state.completion > 0} text="Criar primeira vaga" />
          <ChecklistItem done={state.certificationsCount > 0} text="Publicar vaga ativa" />
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="soft-card rounded-[8px] p-5 transition hover:-translate-y-0.5 hover:border-cyan-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-cyan-50 text-cyan-800">
          {icon}
        </div>
        <span className="rounded-full bg-slate-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          BioConecta
        </span>
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function QuickStatus({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[8px] border border-cyan-100 bg-white/72 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function ChecklistItem({ done, text }: { done: boolean; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
          done ? "bg-cyan-500 text-slate-950" : "bg-white text-slate-500"
        }`}
      >
        {done ? "OK" : "-"}
      </span>
      <span className="text-sm font-medium text-slate-700">{text}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = getCompanyStatusLabel(status);

  return (
    <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
      {label}
    </span>
  );
}

function getCompanyStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Verificacao pendente",
    PENDING_PROFILE: "Cadastro pendente",
    REJECTED: "Empresa rejeitada",
    UNVERIFIED: "Nao verificada",
    VERIFIED: "Verificada",
  };

  return labels[status] ?? status;
}

function getBiologistStage(state: DashboardState) {
  if (!state.emailVerifiedAt) {
    return "Validar e-mail";
  }

  if (!state.profileExists) {
    return "Onboarding pendente";
  }

  if (!state.professionalStarted) {
    return "Perfil profissional pendente";
  }

  if (state.completion < 80) {
    return "Perfil em evolucao";
  }

  return "Pronto para candidaturas";
}

function getDashboardSummary(state: DashboardState) {
  if (state.isCompanyAccount) {
    return "Gerencie empresa, vagas publicadas, rascunhos e proximas acoes para receber candidatos com mais contexto.";
  }

  if (state.isBiologistAccount) {
    return "Acompanhe seu perfil, documentos, candidaturas e oportunidades alinhadas com sua experiencia tecnica.";
  }

  return "Acompanhe oportunidades, favoritos e notificacoes da sua conta BioConecta.";
}

function getAccountArea(state: DashboardState) {
  if (state.isCompanyAccount) {
    return "Empresa";
  }

  if (state.isBiologistAccount) {
    return "Biologo";
  }

  return "Estudante";
}

function getPrimaryAction(state: DashboardState) {
  if (state.isCompanyAccount) {
    return (
      <Button asChild>
        <Link href={state.company ? "/empresa/vagas" : "/empresa"}>
          {state.company ? "Gerenciar vagas" : "Cadastrar empresa"}
        </Link>
      </Button>
    );
  }

  if (state.isBiologistAccount) {
    return (
      <Button asChild>
        <Link href={state.profileExists ? "/perfil/profissional" : "/onboarding/biologo"}>
          {state.profileExists ? "Atualizar perfil" : "Completar onboarding"}
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild>
      <Link href="/vagas">Buscar oportunidades</Link>
    </Button>
  );
}

function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length !== 14) {
    return value;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(
    8,
    12,
  )}-${digits.slice(12)}`;
}
