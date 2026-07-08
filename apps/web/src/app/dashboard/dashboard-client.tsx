"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { apiFetch, getStoredAccessToken } from "@/lib/api";

type DashboardState = {
  company: CompanySummary | null;
  certificationsCount: number;
  completion: number;
  documentsCount: number;
  email: string;
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

    apiFetch<{ user: { email: string; firstName: string; roles: string[] } }>("/auth/me", {
      token,
    })
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
    return <p className="text-slate-600">Carregando dashboard...</p>;
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Ola, {state.firstName}</h1>
            <p className="mt-2 text-slate-600">{state.email}</p>
          </div>
          <LogoutButton />
        </div>
      </section>

      {state.isBiologistAccount ? (
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[8px] border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Conclusao do perfil</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{state.completion}%</p>
          </div>
          <div className="rounded-[8px] border border-slate-200 bg-white p-5 md:col-span-2">
            <p className="text-sm text-slate-500">Headline</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{state.title}</p>
          </div>
        </section>
      ) : null}

      {state.profileExists ? (
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[8px] border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Experiencias</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{state.experiencesCount}</p>
          </div>
          <div className="rounded-[8px] border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Certificacoes</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {state.certificationsCount}
            </p>
          </div>
          <div className="rounded-[8px] border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Documentos</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{state.documentsCount}</p>
          </div>
        </section>
      ) : null}

      {state.isBiologistAccount ? (
        <section className="rounded-[8px] border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-950">
            {state.profileExists
              ? state.professionalStarted
                ? "Seu perfil profissional esta avancando."
                : "Complete seu perfil profissional."
              : "Complete seu onboarding."}
          </h2>
          <p className="mt-2 text-slate-600">
            Adicione documentos, areas de atuacao, grupos taxonomicos, competencias, experiencias e
            certificacoes.
          </p>
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
        <section className="rounded-[8px] border border-slate-200 bg-white p-6">
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
        <section className="rounded-[8px] border border-cyan-200 bg-cyan-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-800">
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
      <section className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm">
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
          <MetricCard label="Total de vagas" value={state.completion} />
          <MetricCard label="Publicadas" value={state.certificationsCount} />
          <MetricCard label="Rascunhos" value={state.experiencesCount} />
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

      <section className="rounded-[8px] border border-slate-200 bg-white p-6">
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

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
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
