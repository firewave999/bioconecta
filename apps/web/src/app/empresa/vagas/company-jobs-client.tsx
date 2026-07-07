"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { apiFetch, getStoredAccessToken } from "@/lib/api";

type Job = {
  city: string;
  createdAt: string;
  id: string;
  status: string;
  state: string;
  title: string;
};

export function CompanyJobsClient() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredAccessToken();

    if (!token) {
      setError("Voce precisa entrar para acessar as vagas da empresa.");
      return;
    }

    apiFetch<{ company: { name: string; verificationStatus?: string }; jobs: Job[] }>(
      "/jobs/mine",
      { token },
    )
      .then((response) => {
        setCompanyName(response.company.name);
        setVerificationStatus(response.company.verificationStatus ?? null);
        setJobs(response.jobs);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Nao foi possivel carregar as vagas."),
      );
  }, []);

  if (error) {
    return (
      <div className="rounded-[8px] border border-red-200 bg-red-50 p-5 text-red-700">
        <p>{error}</p>
        <Button asChild className="mt-4">
          <Link href="/empresa">Cadastrar empresa</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="flex flex-col gap-4 rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">Vagas</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            {companyName ?? "Carregando empresa..."}
          </h1>
          {verificationStatus ? (
            <p className="mt-2 text-sm font-semibold text-slate-600">
              Status da empresa: {getCompanyStatusLabel(verificationStatus)}
            </p>
          ) : null}
        </div>
        <Button asChild>
          <Link href="/empresa/vagas/nova">Nova vaga</Link>
        </Button>
      </section>

      <section className="grid gap-4">
        {jobs.length ? (
          jobs.map((job) => (
            <article className="rounded-[8px] border border-slate-200 bg-white p-5" key={job.id}>
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">{job.title}</h2>
                  <p className="mt-1 text-slate-600">
                    {job.city}/{job.state}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  {job.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild size="sm">
                  <Link href={`/empresa/vagas/${job.id}`}>Editar vaga</Link>
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/empresa/vagas/${job.id}/candidatos`}>Ver candidatos</Link>
                </Button>
                {job.status === "PUBLISHED" ? (
                  <Button asChild size="sm">
                    <Link href={`/vagas/${job.id}`}>Ver vaga publica</Link>
                  </Button>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[8px] border border-slate-200 bg-white p-6 text-slate-600">
            Nenhuma vaga criada ainda.
          </div>
        )}
      </section>
    </div>
  );
}

function getCompanyStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Verificacao pendente",
    REJECTED: "Rejeitada",
    UNVERIFIED: "Nao verificada",
    VERIFIED: "Verificada",
  };

  return labels[status] ?? status;
}
