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
  biologists: Biologist[];
  companies: Company[];
  jobs: Job[];
  overview: Overview;
  users: AdminUser[];
};

export function AdminClient() {
  const [state, setState] = useState<AdminState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  async function loadAdminData() {
    const token = getStoredAccessToken();

    if (!token) {
      setError("Voce precisa entrar com uma conta admin.");
      return;
    }

    const [overview, users, companies, biologists, jobs, applications] = await Promise.all([
      apiFetch<Overview>("/admin/overview", { token }),
      apiFetch<AdminUser[]>("/admin/users", { token }),
      apiFetch<Company[]>("/admin/companies", { token }),
      apiFetch<Biologist[]>("/admin/biologists", { token }),
      apiFetch<Job[]>("/admin/jobs", { token }),
      apiFetch<Application[]>("/admin/applications", { token }),
    ]);

    setState({ applications, biologists, companies, jobs, overview, users });
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

  if (error) {
    return (
      <div className="rounded-[8px] border border-red-200 bg-red-50 p-5 text-red-700">
        <p>{error}</p>
        <Button asChild className="mt-4">
          <Link href="/login">Entrar</Link>
        </Button>
      </div>
    );
  }

  if (!state) {
    return <p className="text-slate-600">Carregando painel admin...</p>;
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Usuarios" value={state.overview.usersCount} />
        <Metric label="Empresas verificadas" value={state.overview.verifiedCompaniesCount} />
        <Metric label="Biologos verificados" value={state.overview.verifiedBiologistsCount} />
        <Metric label="Vagas publicadas" value={state.overview.publishedJobsCount} />
      </section>

      <section className="rounded-[8px] border border-slate-200 bg-white p-6">
        <SectionTitle title="Empresas" subtitle={`${state.overview.companiesCount} cadastradas`} />
        <div className="mt-5 grid gap-3">
          {state.companies.map((company) => (
            <article className="rounded-[8px] border border-slate-200 p-4" key={company.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">{company.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {company.city}/{company.state} · CNPJ {company.cnpj}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Dono: {company.owner.email} · Status: {company.verificationStatus}
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

      <section className="rounded-[8px] border border-slate-200 bg-white p-6">
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
                    CRBio {biologist.crbioNumber}/{biologist.crbioRegion} · {biologist.city}/
                    {biologist.state}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {biologist.user.email} · Status: {biologist.verificationStatus}
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

      <section className="rounded-[8px] border border-slate-200 bg-white p-6">
        <SectionTitle title="Vagas" subtitle={`${state.overview.jobsCount} vagas criadas`} />
        <div className="mt-5 grid gap-3">
          {state.jobs.map((job) => (
            <article className="rounded-[8px] border border-slate-200 p-4" key={job.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">{job.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {job.company.name} · {job.city}/{job.state}
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

      <section className="grid gap-4 md:grid-cols-2">
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
                  {application.status} · match {application.matchScore}%
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
