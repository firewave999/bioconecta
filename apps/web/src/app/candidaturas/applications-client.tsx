"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { apiFetch, getStoredAccessToken } from "@/lib/api";

type Application = {
  id: string;
  job: {
    city: string;
    company?: { name: string };
    id: string;
    state: string;
    title: string;
  };
  matchScore: number;
  status: string;
};

export function ApplicationsClient() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredAccessToken();

    if (!token) {
      setError("Voce precisa entrar para ver suas candidaturas.");
      return;
    }

    apiFetch<{ applications: Application[] }>("/applications/mine", { token })
      .then((response) => setApplications(response.applications))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Nao foi possivel carregar candidaturas."),
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
      {applications.length ? (
        applications.map((application) => (
          <article className="soft-card rounded-[8px] p-5" key={application.id}>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
              {application.job.company?.name ?? "Empresa"}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">{application.job.title}</h2>
            <p className="mt-2 text-slate-600">
              {application.job.city}/{application.job.state} | Status: {application.status} | Match:{" "}
              {application.matchScore}%
            </p>
            <Button asChild className="mt-4" size="sm" variant="secondary">
              <Link href={`/vagas/${application.job.id}`}>Ver vaga</Link>
            </Button>
          </article>
        ))
      ) : (
        <EmptyState
          actionHref="/vagas"
          actionLabel="Buscar vagas"
          description="Quando voce se candidatar a uma vaga, ela aparecera aqui com status e match."
          title="Nenhuma candidatura enviada ainda"
        />
      )}
    </section>
  );
}
