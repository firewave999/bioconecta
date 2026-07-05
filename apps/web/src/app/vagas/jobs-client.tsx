"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

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

const emptyFilters = {
  city: "",
  contractType: "",
  q: "",
  requirement: "",
  state: "",
  workMode: "",
};

export function JobsClient() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(false);

  const loadJobs = useCallback(
    async (nextFilters: typeof emptyFilters) => {
      setLoading(true);
      const params = new URLSearchParams();

      for (const [key, value] of Object.entries(nextFilters)) {
        if (value.trim()) {
          params.set(key, value.trim());
        }
      }

      apiFetch<{ jobs: Job[] }>(`/jobs${params.size ? `?${params.toString()}` : ""}`)
        .then((response) => setJobs(response.jobs))
        .catch((err) =>
          setError(err instanceof Error ? err.message : "Nao foi possivel carregar as vagas."),
        )
        .finally(() => setLoading(false));
    },
    [filters],
  );

  useEffect(() => {
    void loadJobs(emptyFilters);
  }, [loadJobs]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadJobs(filters);
  }

  function clearFilters() {
    setFilters(emptyFilters);
    void loadJobs(emptyFilters);
  }

  if (error) {
    return (
      <div className="rounded-[8px] border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>
    );
  }

  return (
    <div className="grid gap-6">
      <form
        className="grid gap-4 rounded-[8px] border border-slate-200 bg-white p-5 md:grid-cols-3"
        onSubmit={handleSubmit}
      >
        <Field
          label="Busca"
          onChange={(value) => setFilters({ ...filters, q: value })}
          placeholder="Cargo, descricao ou empresa"
          value={filters.q}
        />
        <Field
          label="Estado"
          maxLength={2}
          onChange={(value) => setFilters({ ...filters, state: value })}
          placeholder="SP"
          value={filters.state}
        />
        <Field
          label="Cidade"
          onChange={(value) => setFilters({ ...filters, city: value })}
          placeholder="Sao Paulo"
          value={filters.city}
        />
        <Select
          label="Contrato"
          onChange={(value) => setFilters({ ...filters, contractType: value })}
          options={[
            ["", "Todos"],
            ["CLT", "CLT"],
            ["PJ", "PJ"],
            ["FREELANCE", "Freelance"],
            ["INTERNSHIP", "Estagio"],
            ["TEMPORARY", "Temporario"],
          ]}
          value={filters.contractType}
        />
        <Select
          label="Modo"
          onChange={(value) => setFilters({ ...filters, workMode: value })}
          options={[
            ["", "Todos"],
            ["FIELD", "Campo"],
            ["ON_SITE", "Presencial"],
            ["HYBRID", "Hibrido"],
            ["REMOTE", "Remoto"],
          ]}
          value={filters.workMode}
        />
        <Field
          label="Requisito"
          onChange={(value) => setFilters({ ...filters, requirement: value })}
          placeholder="QGIS, Aves, Inventario de fauna"
          value={filters.requirement}
        />
        <div className="flex gap-3 md:col-span-3">
          <button
            className="h-11 rounded-[8px] bg-cyan-400 px-5 text-sm font-semibold text-slate-950"
            type="submit"
          >
            {loading ? "Buscando..." : "Filtrar vagas"}
          </button>
          <button
            className="h-11 rounded-[8px] bg-slate-100 px-5 text-sm font-semibold text-slate-700"
            onClick={clearFilters}
            type="button"
          >
            Limpar
          </button>
        </div>
      </form>

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
    </div>
  );
}

function Field({
  label,
  maxLength,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  maxLength?: number;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <input
        className="h-11 rounded-[8px] border border-slate-300 px-3 text-slate-950 outline-none focus:border-cyan-500"
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function Select({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[][];
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <select
        className="h-11 rounded-[8px] border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-cyan-500"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map(([optionValue, text]) => (
          <option key={optionValue} value={optionValue}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
