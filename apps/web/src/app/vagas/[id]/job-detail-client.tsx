"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { BadgeCheck, BriefcaseBusiness, MapPin, WalletCards } from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiFetch, getStoredAccessToken } from "@/lib/api";

type Job = {
  city: string;
  company?: { name: string };
  contractType: string;
  description: string;
  id: string;
  requiredPracticeAreas: string[];
  requiredSkills: string[];
  requiredTaxonomicGroups: string[];
  salaryMaxCents: number | null;
  salaryMinCents: number | null;
  state: string;
  title: string;
  workMode: string;
};

type Application = {
  id: string;
  matchReasons: string[];
  matchScore: number;
  status: string;
};

export function JobDetailClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [coverMessage, setCoverMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch<{ job: Job }>(`/jobs/${params.id}`)
      .then((response) => setJob(response.job))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Não foi possível carregar a vaga."),
      );

    const token = getStoredAccessToken();

    if (token) {
      apiFetch<{ application: Application | null }>(`/applications/jobs/${params.id}/me`, {
        token,
      })
        .then((response) => setApplication(response.application))
        .catch(() => undefined);
      apiFetch<{ saved: boolean }>(`/favorites/jobs/${params.id}`, { token })
        .then((response) => setSaved(response.saved))
        .catch(() => undefined);
    }
  }, [params.id]);

  async function handleApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const token = getStoredAccessToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await apiFetch<{ application: Application }, Record<string, unknown>>(
        `/applications/jobs/${params.id}`,
        {
          body: { coverMessage },
          method: "POST",
          token,
        },
      );
      setApplication(response.application);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar candidatura.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite() {
    const token = getStoredAccessToken();

    if (!token) {
      router.push("/login");
      return;
    }

    setFavoriteLoading(true);

    try {
      if (saved) {
        await apiFetch<{ success: boolean }>(`/favorites/jobs/${params.id}`, {
          method: "DELETE",
          token,
        });
        setSaved(false);
      } else {
        await apiFetch<{ savedJob: unknown }>(`/favorites/jobs/${params.id}`, {
          method: "POST",
          token,
        });
        setSaved(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar favorito.");
    } finally {
      setFavoriteLoading(false);
    }
  }

  if (error && !job) {
    return (
      <div className="rounded-[8px] border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>
    );
  }

  if (!job) {
    return (
      <div className="grid gap-6">
        <div className="page-header h-72 animate-pulse rounded-[8px]" />
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
      <section className="page-header overflow-hidden rounded-[8px]">
        <div className="grid lg:grid-cols-[1fr_320px]">
          <div className="p-6 md:p-8">
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
              <BriefcaseBusiness size={16} />
              {job.company?.name ?? "Empresa"}
            </p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              {job.title}
            </h1>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge>{formatContractType(job.contractType)}</Badge>
              <Badge>{formatWorkMode(job.workMode)}</Badge>
              <Badge>
                {job.city}/{job.state}
              </Badge>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                disabled={favoriteLoading}
                onClick={toggleFavorite}
                type="button"
                variant="secondary"
              >
                {saved ? "Remover dos favoritos" : "Salvar vaga"}
              </Button>
              <Button asChild variant="light">
                <Link href="/vagas">Voltar para vagas</Link>
              </Button>
            </div>
          </div>
          <aside className="border-t border-cyan-100 bg-cyan-50/60 p-6 lg:border-l lg:border-t-0">
            <SummaryItem
              icon={<MapPin size={18} />}
              label="Local"
              value={`${job.city}/${job.state}`}
            />
            <SummaryItem
              icon={<WalletCards size={18} />}
              label="Remuneracao"
              value={formatSalary(job.salaryMinCents, job.salaryMaxCents)}
            />
            <SummaryItem
              icon={<BadgeCheck size={18} />}
              label="Modalidade"
              value={`${formatContractType(job.contractType)} · ${formatWorkMode(job.workMode)}`}
            />
          </aside>
        </div>
      </section>

      <section className="soft-card rounded-[8px] p-6">
        <h2 className="text-xl font-semibold text-slate-950">Descrição</h2>
        <p className="mt-3 whitespace-pre-line text-slate-700">{job.description}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <RequirementCard title="Áreas" values={job.requiredPracticeAreas} />
        <RequirementCard title="Grupos taxonomicos" values={job.requiredTaxonomicGroups} />
        <RequirementCard title="Competencias" values={job.requiredSkills} />
      </section>

      <section className="soft-card rounded-[8px] p-6">
        <h2 className="text-xl font-semibold text-slate-950">Candidatura</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <CheckItem text="Revise os requisitos" />
          <CheckItem text="Confira seu perfil profissional" />
          <CheckItem text="Envie uma mensagem objetiva" />
        </div>
        {application ? (
          <div className="mt-4 rounded-[8px] bg-cyan-50 p-4 text-cyan-900">
            <p className="font-semibold">Você já se candidatou.</p>
            <p className="mt-1">Status: {getApplicationStatusLabel(application.status)}</p>
            <p className="mt-1">Compatibilidade inicial: {application.matchScore}%</p>
            {application.matchReasons.length ? (
              <ul className="mt-3 list-inside list-disc text-sm">
                {application.matchReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            ) : null}
            <Button asChild className="mt-4" variant="secondary">
              <Link href="/candidaturas">Minhas candidaturas</Link>
            </Button>
          </div>
        ) : (
          <form className="mt-4 grid gap-4" onSubmit={handleApply}>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Mensagem para a empresa
              <textarea
                className="field-input min-h-28 rounded-[8px] px-3 py-3"
                onChange={(event) => setCoverMessage(event.target.value)}
                placeholder="Explique em poucas linhas sua experiência relacionada a esta vaga, disponibilidade e forma de contato."
                value={coverMessage}
              />
            </label>
            {error ? (
              <p className="rounded-[8px] bg-red-50 p-3 text-sm text-red-700">{error}</p>
            ) : null}
            <Button disabled={loading} type="submit">
              {loading ? "Enviando..." : "Candidatar-se"}
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700">
      {text}
    </div>
  );
}

function SummaryItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="border-b border-cyan-100 py-4 first:pt-0 last:border-b-0 last:pb-0">
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-cyan-800">
        {icon}
        {label}
      </p>
      <p className="mt-2 font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function RequirementCard({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="soft-card rounded-[8px] p-5">
      <h2 className="font-semibold text-slate-950">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {values.length ? (
          values.map((value) => <Badge key={value}>{value}</Badge>)
        ) : (
          <Badge>Não informado</Badge>
        )}
      </div>
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
      {children}
    </span>
  );
}

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) {
    return "Remuneracao não informada";
  }

  const formatter = new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  });

  if (min && max) {
    return `${formatter.format(min / 100)} a ${formatter.format(max / 100)}`;
  }

  return formatter.format(((min ?? max) as number) / 100);
}

function getApplicationStatusLabel(status: string) {
  const labels: Record<string, string> = {
    APPLIED: "Inscrito",
    HIRED: "Contratado",
    INTERVIEW: "Entrevista",
    OFFER: "Oferta",
    REJECTED: "Rejeitado",
    SHORTLISTED: "Selecionado",
    UNDER_REVIEW: "Em análise",
    WITHDRAWN: "Retirado",
  };

  return labels[status] ?? status;
}

function formatContractType(value: string) {
  const labels: Record<string, string> = {
    CLT: "CLT",
    FREELANCE: "Freelance",
    INTERNSHIP: "Estágio",
    PJ: "PJ",
    TEMPORARY: "Temporário",
  };

  return labels[value] ?? value;
}

function formatWorkMode(value: string) {
  const labels: Record<string, string> = {
    FIELD: "Campo",
    HYBRID: "Hibrido",
    ON_SITE: "Presencial",
    REMOTE: "Remoto",
  };

  return labels[value] ?? value;
}
