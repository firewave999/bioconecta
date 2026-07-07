"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { apiFetch, getStoredAccessToken } from "@/lib/api";

type AdminUser = {
  createdAt: string;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  roles: string[];
};

type Company = {
  city: string;
  cnpj: string;
  createdAt: string;
  id: string;
  name: string;
  owner: AdminUser;
  state: string;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
};

type Biologist = {
  city: string;
  crbioNumber: string;
  crbioRegion: string;
  fullName: string;
  id: string;
  state: string;
  user: AdminUser;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED";
};

type Job = {
  city: string;
  company: Company;
  id: string;
  state: string;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  title: string;
};

type Application = {
  biologistProfile: Biologist;
  createdAt: string;
  id: string;
  job: Job;
  matchScore: number;
  status: string;
};

type AuditLog = {
  action: string;
  actor: AdminUser;
  afterState: Record<string, unknown> | null;
  beforeState: Record<string, unknown> | null;
  createdAt: string;
  id: string;
  targetId: string;
  targetType: string;
};

type Overview = {
  applicationsCount: number;
  biologistProfilesCount: number;
  companiesCount: number;
  jobsCount: number;
  publishedJobsCount: number;
  usersCount: number;
  verifiedBiologistsCount: number;
  verifiedCompaniesCount: number;
};

type AdminState = {
  applications: Application[];
  auditLogs: AuditLog[];
  biologists: Biologist[];
  companies: Company[];
  jobs: Job[];
  overview: Overview;
  users: AdminUser[];
};

type AuthState = "checking" | "allowed" | "denied";

export function AdminClient() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [state, setState] = useState<AdminState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  async function loadAdminData() {
    const token = getStoredAccessToken();

    if (!token) {
      setError("Voce precisa entrar com uma conta admin.");
      return;
    }

    const me = await apiFetch<{ user: { roles: string[] } }>("/auth/me", { token });

    if (!me.user.roles.includes("ADMIN")) {
      setAuthState("denied");
      setError("Esta area e exclusiva para administradores.");
      return;
    }

    setAuthState("allowed");

    const [overview, users, companies, biologists, jobs, applications, auditLogs] =
      await Promise.all([
        apiFetch<Overview>("/admin/overview", { token }),
        apiFetch<AdminUser[]>("/admin/users", { token }),
        apiFetch<Company[]>("/admin/companies", { token }),
        apiFetch<Biologist[]>("/admin/biologists", { token }),
        apiFetch<Job[]>("/admin/jobs", { token }),
        apiFetch<Application[]>("/admin/applications", { token }),
        apiFetch<AuditLog[]>("/admin/audit-logs", { token }),
      ]);

    setState({ applications, auditLogs, biologists, companies, jobs, overview, users });
    setError(null);
  }

  useEffect(() => {
    loadAdminData().catch((err) => {
      setError(err instanceof Error ? err.message : "Nao foi possivel carregar o admin.");
    });
  }, []);

  async function updateCompanyStatus(
    id: string,
    verificationStatus: Company["verificationStatus"],
  ) {
    await runAction(`company-${id}-${verificationStatus}`, async (token) => {
      await apiFetch(`/admin/companies/${id}/verification`, {
        body: { verificationStatus },
        method: "PUT",
        token,
      });
    });
  }

  async function updateBiologistStatus(
    id: string,
    verificationStatus: Biologist["verificationStatus"],
  ) {
    await runAction(`biologist-${id}-${verificationStatus}`, async (token) => {
      await apiFetch(`/admin/biologists/${id}/verification`, {
        body: { verificationStatus },
        method: "PUT",
        token,
      });
    });
  }

  async function updateJobStatus(id: string, status: Job["status"]) {
    await runAction(`job-${id}-${status}`, async (token) => {
      await apiFetch(`/admin/jobs/${id}/status`, {
        body: { status },
        method: "PUT",
        token,
      });
    });
  }

  async function runAction(action: string, fn: (token: string) => Promise<void>) {
    const token = getStoredAccessToken();

    if (!token) {
      setError("Sessao expirada. Entre novamente.");
      return;
    }

    setBusyAction(action);

    try {
      await fn(token);
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel concluir a acao.");
    } finally {
      setBusyAction(null);
    }
  }

  if (authState === "checking" && !error) {
    return <p className="text-slate-600">Validando acesso admin...</p>;
  }

  if (error) {
    return (
      <div className="rounded-[8px] border border-red-200 bg-red-50 p-5 text-red-700">
        <p>{error}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {authState === "denied" ? (
            <Button asChild>
              <Link href="/dashboard">Voltar ao dashboard</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/login">Entrar</Link>
            </Button>
          )}
          <Button asChild variant="secondary">
            <Link href="/">Voltar para home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!state) {
    return <p className="text-slate-600">Carregando painel admin...</p>;
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-4" id="visao-geral">
        <Metric label="Usuarios" value={state.overview.usersCount} />
        <Metric label="Empresas verificadas" value={state.overview.verifiedCompaniesCount} />
        <Metric label="Biologos verificados" value={state.overview.verifiedBiologistsCount} />
        <Metric label="Vagas publicadas" value={state.overview.publishedJobsCount} />
      </section>

      <section className="rounded-[8px] border border-slate-200 bg-white p-6" id="empresas">
        <SectionTitle title="Empresas" subtitle={`${state.overview.companiesCount} cadastradas`} />
        <div className="mt-5 grid gap-3">
          {state.companies.map((company) => (
            <article className="rounded-[8px] border border-slate-200 p-4" key={company.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">{company.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {company.city}/{company.state} - CNPJ {company.cnpj}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Dono: {company.owner.email} - Status: {company.verificationStatus}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    busy={busyAction === `company-${company.id}-VERIFIED`}
                    onClick={() => updateCompanyStatus(company.id, "VERIFIED")}
                  >
                    Verificar
                  </ActionButton>
                  <ActionButton
                    busy={busyAction === `company-${company.id}-REJECTED`}
                    onClick={() => updateCompanyStatus(company.id, "REJECTED")}
                    variant="secondary"
                  >
                    Rejeitar
                  </ActionButton>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[8px] border border-slate-200 bg-white p-6" id="biologos">
        <SectionTitle
          title="Biologos"
          subtitle={`${state.overview.biologistProfilesCount} perfis cadastrados`}
        />
        <div className="mt-5 grid gap-3">
          {state.biologists.map((biologist) => (
            <article className="rounded-[8px] border border-slate-200 p-4" key={biologist.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">{biologist.fullName}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    CRBio {biologist.crbioNumber}/{biologist.crbioRegion} - {biologist.city}/
                    {biologist.state}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {biologist.user.email} - Status: {biologist.verificationStatus}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    busy={busyAction === `biologist-${biologist.id}-VERIFIED`}
                    onClick={() => updateBiologistStatus(biologist.id, "VERIFIED")}
                  >
                    Verificar
                  </ActionButton>
                  <ActionButton
                    busy={busyAction === `biologist-${biologist.id}-REJECTED`}
                    onClick={() => updateBiologistStatus(biologist.id, "REJECTED")}
                    variant="secondary"
                  >
                    Rejeitar
                  </ActionButton>
                  <ActionButton
                    busy={busyAction === `biologist-${biologist.id}-SUSPENDED`}
                    onClick={() => updateBiologistStatus(biologist.id, "SUSPENDED")}
                    variant="secondary"
                  >
                    Suspender
                  </ActionButton>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[8px] border border-slate-200 bg-white p-6" id="vagas">
        <SectionTitle title="Vagas" subtitle={`${state.overview.jobsCount} vagas criadas`} />
        <div className="mt-5 grid gap-3">
          {state.jobs.map((job) => (
            <article className="rounded-[8px] border border-slate-200 p-4" key={job.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">{job.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {job.company.name} - {job.city}/{job.state}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Status: {job.status}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    busy={busyAction === `job-${job.id}-PUBLISHED`}
                    onClick={() => updateJobStatus(job.id, "PUBLISHED")}
                  >
                    Publicar
                  </ActionButton>
                  <ActionButton
                    busy={busyAction === `job-${job.id}-CLOSED`}
                    onClick={() => updateJobStatus(job.id, "CLOSED")}
                    variant="secondary"
                  >
                    Fechar
                  </ActionButton>
                  <ActionButton
                    busy={busyAction === `job-${job.id}-DRAFT`}
                    onClick={() => updateJobStatus(job.id, "DRAFT")}
                    variant="secondary"
                  >
                    Rascunho
                  </ActionButton>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2" id="candidaturas">
        <div className="rounded-[8px] border border-slate-200 bg-white p-6">
          <SectionTitle
            title="Candidaturas recentes"
            subtitle={`${state.overview.applicationsCount} candidaturas`}
          />
          <div className="mt-5 grid gap-3">
            {state.applications.slice(0, 10).map((application) => (
              <article className="rounded-[8px] border border-slate-200 p-4" key={application.id}>
                <p className="font-semibold text-slate-950">
                  {application.biologistProfile.fullName}
                </p>
                <p className="mt-1 text-sm text-slate-600">{application.job.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {application.status} - match {application.matchScore}%
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[8px] border border-slate-200 bg-white p-6">
          <SectionTitle title="Usuarios recentes" subtitle="Ultimos 100 usuarios" />
          <div className="mt-5 grid gap-3">
            {state.users.slice(0, 10).map((user) => (
              <article className="rounded-[8px] border border-slate-200 p-4" key={user.id}>
                <p className="font-semibold text-slate-950">
                  {user.firstName} {user.lastName}
                </p>
                <p className="mt-1 text-sm text-slate-600">{user.email}</p>
                <p className="mt-1 text-sm text-slate-500">Roles: {user.roles.join(", ")}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[8px] border border-slate-200 bg-white p-6" id="auditoria">
        <SectionTitle title="Auditoria admin" subtitle="Ultimas 100 acoes sensiveis" />
        <div className="mt-5 grid gap-3">
          {state.auditLogs.slice(0, 20).map((log) => (
            <article className="rounded-[8px] border border-slate-200 p-4" key={log.id}>
              <p className="font-semibold text-slate-950">{formatAuditAction(log.action)}</p>
              <p className="mt-1 text-sm text-slate-600">
                {log.actor.email} - {log.targetType} - {new Date(log.createdAt).toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Antes: {formatAuditState(log.beforeState)} - Depois:{" "}
                {formatAuditState(log.afterState)}
              </p>
            </article>
          ))}
          {state.auditLogs.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma acao auditada ainda.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function SectionTitle({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

function ActionButton({
  busy,
  children,
  onClick,
  variant = "primary",
}: {
  busy: boolean;
  children: ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <Button disabled={busy} onClick={onClick} size="sm" type="button" variant={variant}>
      {busy ? "Salvando..." : children}
    </Button>
  );
}

function formatAuditAction(action: string) {
  const labels: Record<string, string> = {
    BIOLOGIST_VERIFICATION_UPDATED: "Verificacao de biologo alterada",
    COMPANY_VERIFICATION_UPDATED: "Verificacao de empresa alterada",
    JOB_STATUS_UPDATED: "Status de vaga alterado",
  };

  return labels[action] ?? action;
}

function formatAuditState(state: Record<string, unknown> | null) {
  if (!state) {
    return "-";
  }

  return Object.entries(state)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}
