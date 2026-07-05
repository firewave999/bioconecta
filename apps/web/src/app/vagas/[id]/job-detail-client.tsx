"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
        setError(err instanceof Error ? err.message : "Nao foi possivel carregar a vaga."),
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
      setError(err instanceof Error ? err.message : "Nao foi possivel enviar candidatura.");
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
      setError(err instanceof Error ? err.message : "Nao foi possivel atualizar favorito.");
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
    return <p className="text-slate-600">Carregando vaga...</p>;
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          {job.company?.name ?? "Empresa"}
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-950">{job.title}</h1>
        <p className="mt-3 text-slate-600">
          {job.city}/{job.state} | {job.contractType} | {job.workMode}
        </p>
        <p className="mt-3 text-slate-600">
          {formatSalary(job.salaryMinCents, job.salaryMaxCents)}
        </p>
        <Button
          className="mt-5"
          disabled={favoriteLoading}
          onClick={toggleFavorite}
          type="button"
          variant="secondary"
        >
          {saved ? "Remover dos favoritos" : "Salvar vaga"}
        </Button>
      </section>

      <section className="rounded-[8px] border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-950">Descricao</h2>
        <p className="mt-3 whitespace-pre-line text-slate-700">{job.description}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <RequirementCard title="Areas" values={job.requiredPracticeAreas} />
        <RequirementCard title="Grupos taxonomicos" values={job.requiredTaxonomicGroups} />
        <RequirementCard title="Competencias" values={job.requiredSkills} />
      </section>

      <section className="rounded-[8px] border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-950">Candidatura</h2>
        {application ? (
          <div className="mt-4 rounded-[8px] bg-cyan-50 p-4 text-cyan-900">
            <p className="font-semibold">Voce ja se candidatou.</p>
            <p className="mt-1">Status: {application.status}</p>
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
                className="min-h-28 rounded-[8px] border border-slate-300 px-3 py-3 text-slate-950 outline-none focus:border-cyan-500"
                onChange={(event) => setCoverMessage(event.target.value)}
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

function RequirementCard({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-5">
      <h2 className="font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">
        {values.length ? values.join(", ") : "Nao informado"}
      </p>
    </div>
  );
}

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) {
    return "Remuneracao nao informada";
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
