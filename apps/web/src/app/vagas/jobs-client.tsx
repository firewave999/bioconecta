"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";

type Job = {
  city: string;
  company?: {
    name: string;
  };
  contractType: string;
  id: string;
  state: string;
  title: string;
  workMode: string;
};

export function JobsClient() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ jobs: Job[] }>("/jobs")
      .then((response) => setJobs(response.jobs))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Nao foi possivel carregar as vagas."),
      );
  }, []);

  if (error) {
    return (
      <div className="rounded-[8px] border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>
    );
  }

  return (
    <section className="grid gap-4">
      {jobs.length ? (
        jobs.map((job) => (
          <article
            className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm"
            key={job.id}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
              {job.company?.name ?? "Empresa"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{job.title}</h2>
            <p className="mt-2 text-slate-600">
              {job.city}/{job.state} | {job.contractType} | {job.workMode}
            </p>
            <Link
              className="mt-4 inline-flex text-sm font-semibold text-cyan-800"
              href={`/vagas/${job.id}`}
            >
              Ver detalhes
            </Link>
          </article>
        ))
      ) : (
        <div className="rounded-[8px] border border-slate-200 bg-white p-6 text-slate-600">
          Nenhuma vaga publicada ainda.
        </div>
      )}
    </section>
  );
}
