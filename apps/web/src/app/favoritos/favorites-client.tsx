"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { apiFetch, getStoredAccessToken } from "@/lib/api";

type SavedJob = {
  id: string;
  job: {
    city: string;
    company?: { name: string };
    contractType: string;
    id: string;
    state: string;
    title: string;
    workMode: string;
  };
};

export function FavoritesClient() {
  const [error, setError] = useState<string | null>(null);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);

  useEffect(() => {
    const token = getStoredAccessToken();

    if (!token) {
      setError("Voce precisa entrar para ver favoritos.");
      return;
    }

    apiFetch<{ savedJobs: SavedJob[] }>("/favorites/jobs", { token })
      .then((response) => setSavedJobs(response.savedJobs))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Nao foi possivel carregar favoritos."),
      );
  }, []);

  if (error) {
    return (
      <div className="rounded-[8px] border border-red-200 bg-red-50 p-5 text-red-700">
        <p>{error}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard">Voltar ao dashboard</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/login">Ir para login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="grid gap-4">
      {savedJobs.length ? (
        savedJobs.map((savedJob) => (
          <article className="rounded-[8px] border border-slate-200 bg-white p-5" key={savedJob.id}>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
              {savedJob.job.company?.name ?? "Empresa"}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">{savedJob.job.title}</h2>
            <p className="mt-2 text-slate-600">
              {savedJob.job.city}/{savedJob.job.state} | {savedJob.job.contractType} |{" "}
              {savedJob.job.workMode}
            </p>
            <Button asChild className="mt-4" size="sm" variant="secondary">
              <Link href={`/vagas/${savedJob.job.id}`}>Ver vaga</Link>
            </Button>
          </article>
        ))
      ) : (
        <EmptyState
          actionHref="/vagas"
          actionLabel="Buscar vagas"
          description="Salve vagas para comparar oportunidades e voltar nelas depois."
          title="Nenhuma vaga salva ainda"
        />
      )}
    </section>
  );
}
