"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { apiFetch, getStoredAccessToken } from "@/lib/api";

type AdminUser = {
  createdAt: string;
  email: string;
  emailVerifiedAt?: string | null;
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
  verificationNotes: string | null;
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
type CompanyStatusFilter = "ALL" | Company["verificationStatus"];
type BiologistStatusFilter = "ALL" | Biologist["verificationStatus"];
type JobStatusFilter = "ALL" | Job["status"];

export function AdminClient() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [state, setState] = useState<AdminState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [biologistFilter, setBiologistFilter] = useState<BiologistStatusFilter>("ALL");
  const [companyNotes, setCompanyNotes] = useState<Record<string, string>>({});
  const [companyFilter, setCompanyFilter] = useState<CompanyStatusFilter>("ALL");
  const [jobFilter, setJobFilter] = useState<JobStatusFilter>("ALL");
  const [search, setSearch] = useState("");

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
        body: { verificationNotes: companyNotes[id] ?? "", verificationStatus },
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

  const pendingCompanies = state.companies.filter((company) =>
    ["PENDING", "UNVERIFIED"].includes(company.verificationStatus),
  );
  const pendingBiologists = state.biologists.filter((biologist) =>
    ["PENDING", "UNVERIFIED"].includes(biologist.verificationStatus),
  );
  const draftJobs = state.jobs.filter((job) => job.status === "DRAFT");
  const normalizedSearch = normalizeSearch(search);
  const visibleCompanies = state.companies.filter((company) =>
    matchesSearch(normalizedSearch, [
      company.name,
      company.cnpj,
      company.city,
      company.state,
      company.owner.email,
      company.verificationStatus,
    ]),
  );
  const visibleBiologists = state.biologists.filter((biologist) =>
    matchesSearch(normalizedSearch, [
      biologist.fullName,
      biologist.crbioNumber,
      biologist.crbioRegion,
      biologist.city,
      biologist.state,
      biologist.user.email,
      biologist.verificationStatus,
    ]),
  );
  const visibleJobs = state.jobs.filter((job) =>
    matchesSearch(normalizedSearch, [
      job.title,
      job.company.name,
      job.city,
      job.state,
      job.status,
    ]),
  );
  const visibleUsers = state.users.filter((user) =>
    matchesSearch(normalizedSearch, [
      user.email,
      user.firstName,
      user.lastName,
      user.roles.join(" "),
    ]),
  );
  const filteredCompanies =
    companyFilter === "ALL"
      ? visibleCompanies
      : visibleCompanies.filter((company) => company.verificationStatus === companyFilter);
  const filteredBiologists =
    biologistFilter === "ALL"
      ? visibleBiologists
      : visibleBiologists.filter((biologist) => biologist.verificationStatus === biologistFilter);
  const filteredJobs =
    jobFilter === "ALL" ? visibleJobs : visibleJobs.filter((job) => job.status === jobFilter);
  const priorityItems = [
    ...pendingCompanies.slice(0, 4).map((company) => ({
      href: "#empresas",
      label: company.name,
      meta: `${company.city}/${company.state} - ${getCompanyStatusLabel(company.verificationStatus)}`,
      type: "Empresa",
    })),
    ...pendingBiologists.slice(0, 4).map((biologist) => ({
      href: "#biologos",
      label: biologist.fullName,
      meta: `${biologist.city}/${biologist.state} - ${getBiologistStatusLabel(biologist.verificationStatus)}`,
      type: "Biologo",
    })),
    ...draftJobs.slice(0, 4).map((job) => ({
      href: "#vagas",
      label: job.title,
      meta: `${job.company.name} - ${job.city}/${job.state}`,
      type: "Vaga em rascunho",
    })),
  ].slice(0, 8);

  return (
    <div className="grid gap-6">
      <section className="rounded-[8px] border border-slate-200 bg-white p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Buscar no painel
            <input
              className="h-11 rounded-[8px] border border-slate-300 px-3 text-slate-950 outline-none focus:border-cyan-500"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Empresa, biologo, e-mail, CNPJ, vaga, cidade..."
              value={search}
            />
          </label>
          <nav className="flex flex-wrap gap-2 text-sm font-semibold">
            <a className="rounded-full border border-slate-200 px-3 py-2 text-slate-700" href="#pendencias">
              Pendencias
            </a>
            <a className="rounded-full border border-slate-200 px-3 py-2 text-slate-700" href="#empresas">
              Empresas
            </a>
            <a className="rounded-full border border-slate-200 px-3 py-2 text-slate-700" href="#biologos">
              Biologos
            </a>
            <a className="rounded-full border border-slate-200 px-3 py-2 text-slate-700" href="#vagas">
              Vagas
            </a>
          </nav>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4" id="visao-geral">
        <Metric label="Usuarios" value={state.overview.usersCount} />
        <Metric label="Empresas verificadas" value={state.overview.verifiedCompaniesCount} />
        <Metric label="Biologos verificados" value={state.overview.verifiedBiologistsCount} />
        <Metric label="Vagas publicadas" value={state.overview.publishedJobsCount} />
      </section>

      <section className="rounded-[8px] border border-cyan-100 bg-cyan-50 p-6" id="pendencias">
        <SectionTitle
          title="Fila de pendencias"
          subtitle="Itens que normalmente precisam de decisao do administrador"
        />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <PendingCard
            actionHref="#empresas"
            actionLabel="Revisar empresas"
            description="Empresas novas ou ainda nao verificadas."
            title="Empresas"
            value={pendingCompanies.length}
          />
          <PendingCard
            actionHref="#biologos"
            actionLabel="Revisar biologos"
            description="Perfis profissionais aguardando verificacao."
            title="Biologos"
            value={pendingBiologists.length}
          />
          <PendingCard
            actionHref="#vagas"
            actionLabel="Revisar vagas"
            description="Vagas em rascunho que podem precisar de apoio."
            title="Vagas em rascunho"
            value={draftJobs.length}
          />
        </div>
        {priorityItems.length ? (
          <div className="mt-5 rounded-[8px] border border-cyan-200 bg-white p-4">
            <p className="font-semibold text-slate-950">Prioridade de execucao</p>
            <div className="mt-3 grid gap-2">
              {priorityItems.map((item) => (
                <a
                  className="grid gap-1 rounded-[8px] border border-slate-200 bg-slate-50 p-3 hover:border-cyan-300"
                  href={item.href}
                  key={`${item.type}-${item.label}`}
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-800">
                    {item.type}
                  </span>
                  <span className="font-semibold text-slate-950">{item.label}</span>
                  <span className="text-sm text-slate-600">{item.meta}</span>
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-[8px] border border-slate-200 bg-white p-6" id="empresas">
        <SectionTitle title="Empresas" subtitle={`${state.overview.companiesCount} cadastradas`} />
        <FilterBar>
          <FilterButton active={companyFilter === "ALL"} onClick={() => setCompanyFilter("ALL")}>
            Todas
          </FilterButton>
          {(["UNVERIFIED", "PENDING", "VERIFIED", "REJECTED"] as const).map((status) => (
            <FilterButton
              active={companyFilter === status}
              key={status}
              onClick={() => setCompanyFilter(status)}
            >
              {getCompanyStatusLabel(status)}
            </FilterButton>
          ))}
        </FilterBar>
        <div className="mt-5 grid gap-3">
          {filteredCompanies.map((company) => (
            <article className="rounded-[8px] border border-slate-200 p-4" key={company.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">{company.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {company.city}/{company.state} - CNPJ {company.cnpj}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Dono: {company.owner.email} - Status:{" "}
                    {getCompanyStatusLabel(company.verificationStatus)}
                  </p>
                  {!company.owner.emailVerifiedAt ? (
                    <p className="mt-2 w-fit rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      Dono ainda sem e-mail verificado
                    </p>
                  ) : null}
                  {company.verificationNotes ? (
                    <p className="mt-1 text-sm text-slate-500">
                      Observacao: {company.verificationNotes}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-3 md:min-w-80">
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Observacao da verificacao
                    <textarea
                      className="min-h-20 rounded-[8px] border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-cyan-500"
                      onChange={(event) =>
                        setCompanyNotes((current) => ({
                          ...current,
                          [company.id]: event.target.value,
                        }))
                      }
                      placeholder="Ex.: Documentacao conferida ou motivo da rejeicao."
                      value={companyNotes[company.id] ?? company.verificationNotes ?? ""}
                    />
                  </label>
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
                    <ActionButton
                      busy={busyAction === `company-${company.id}-PENDING`}
                      onClick={() => updateCompanyStatus(company.id, "PENDING")}
                      variant="secondary"
                    >
                      Pendente
                    </ActionButton>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {filteredCompanies.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma empresa neste filtro.</p>
          ) : null}
        </div>
      </section>

      <section className="rounded-[8px] border border-slate-200 bg-white p-6" id="biologos">
        <SectionTitle
          title="Biologos"
          subtitle={`${state.overview.biologistProfilesCount} perfis cadastrados`}
        />
        <FilterBar>
          <FilterButton
            active={biologistFilter === "ALL"}
            onClick={() => setBiologistFilter("ALL")}
          >
            Todos
          </FilterButton>
          {(["UNVERIFIED", "PENDING", "VERIFIED", "REJECTED", "SUSPENDED"] as const).map(
            (status) => (
              <FilterButton
                active={biologistFilter === status}
                key={status}
                onClick={() => setBiologistFilter(status)}
              >
                {getBiologistStatusLabel(status)}
              </FilterButton>
            ),
          )}
        </FilterBar>
        <div className="mt-5 grid gap-3">
          {filteredBiologists.map((biologist) => (
            <article className="rounded-[8px] border border-slate-200 p-4" key={biologist.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">{biologist.fullName}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    CRBio {biologist.crbioNumber}/{biologist.crbioRegion} - {biologist.city}/
                    {biologist.state}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {biologist.user.email} - Status:{" "}
                    {getBiologistStatusLabel(biologist.verificationStatus)}
                  </p>
                  {!biologist.user.emailVerifiedAt ? (
                    <p className="mt-2 w-fit rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      E-mail ainda nao verificado
                    </p>
                  ) : null}
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
          {filteredBiologists.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum biologo neste filtro.</p>
          ) : null}
        </div>
      </section>

      <section className="rounded-[8px] border border-slate-200 bg-white p-6" id="vagas">
        <SectionTitle title="Vagas" subtitle={`${state.overview.jobsCount} vagas criadas`} />
        <FilterBar>
          <FilterButton active={jobFilter === "ALL"} onClick={() => setJobFilter("ALL")}>
            Todas
          </FilterButton>
          {(["DRAFT", "PUBLISHED", "CLOSED"] as const).map((status) => (
            <FilterButton
              active={jobFilter === status}
              key={status}
              onClick={() => setJobFilter(status)}
            >
              {getJobStatusLabel(status)}
            </FilterButton>
          ))}
        </FilterBar>
        <div className="mt-5 grid gap-3">
          {filteredJobs.map((job) => (
            <article className="rounded-[8px] border border-slate-200 p-4" key={job.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">{job.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {job.company.name} - {job.city}/{job.state}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Status: {getJobStatusLabel(job.status)}
                  </p>
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
          {filteredJobs.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma vaga neste filtro.</p>
          ) : null}
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
            {visibleUsers.slice(0, 10).map((user) => (
              <article className="rounded-[8px] border border-slate-200 p-4" key={user.id}>
                <p className="font-semibold text-slate-950">
                  {user.firstName} {user.lastName}
                </p>
                <p className="mt-1 text-sm text-slate-600">{user.email}</p>
                <p className="mt-1 text-sm text-slate-500">Roles: {user.roles.join(", ")}</p>
                {!user.emailVerifiedAt ? (
                  <p className="mt-2 w-fit rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                    E-mail nao verificado
                  </p>
                ) : null}
              </article>
            ))}
            {visibleUsers.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum usuario encontrado.</p>
            ) : null}
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

function PendingCard({
  actionHref,
  actionLabel,
  description,
  title,
  value,
}: {
  actionHref: string;
  actionLabel: string;
  description: string;
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-[8px] border border-cyan-200 bg-white p-5">
      <p className="text-sm font-semibold text-cyan-900">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <a className="mt-4 inline-flex text-sm font-semibold text-cyan-800" href={actionHref}>
        {actionLabel}
      </a>
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

function FilterBar({ children }: { children: ReactNode }) {
  return <div className="mt-5 flex flex-wrap gap-2">{children}</div>;
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={
        active
          ? "rounded-full bg-cyan-700 px-3 py-1.5 text-sm font-semibold text-white"
          : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700"
      }
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
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

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function matchesSearch(search: string, values: Array<string | null | undefined>) {
  if (!search) {
    return true;
  }

  return values.some((value) => normalizeSearch(value ?? "").includes(search));
}

function getCompanyStatusLabel(status: Company["verificationStatus"]) {
  const labels: Record<Company["verificationStatus"], string> = {
    PENDING: "Pendente",
    REJECTED: "Rejeitada",
    UNVERIFIED: "Nao verificada",
    VERIFIED: "Verificada",
  };

  return labels[status];
}

function getBiologistStatusLabel(status: Biologist["verificationStatus"]) {
  const labels: Record<Biologist["verificationStatus"], string> = {
    PENDING: "Pendente",
    REJECTED: "Rejeitado",
    SUSPENDED: "Suspenso",
    UNVERIFIED: "Nao verificado",
    VERIFIED: "Verificado",
  };

  return labels[status];
}

function getJobStatusLabel(status: Job["status"]) {
  const labels: Record<Job["status"], string> = {
    CLOSED: "Fechada",
    DRAFT: "Rascunho",
    PUBLISHED: "Publicada",
  };

  return labels[status];
}
