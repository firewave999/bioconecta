"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { BriefcaseBusiness, MapPin, Search, SlidersHorizontal } from "lucide-react";

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

  const loadJobs = useCallback(async (nextFilters: typeof emptyFilters) => {
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
  }, []);

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
        className="soft-card grid gap-4 rounded-[8px] p-5 md:grid-cols-3"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center gap-2 md:col-span-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-cyan-50 text-cyan-800">
            <SlidersHorizontal size={18} />
          </span>
          <div>
            <p className="font-semibold text-slate-950">Filtros de busca</p>
            <p className="text-sm text-slate-500">Combine criterios para reduzir a lista.</p>
          </div>
        </div>
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
              className="soft-card rounded-[8px] p-5 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-lg"
              key={job.id}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                    <BriefcaseBusiness size={16} />
                    {job.company?.name ?? "Empresa"}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    {job.title}
                  </h2>
                  <p className="mt-3 inline-flex items-center gap-2 text-slate-600">
                    <MapPin size={17} className="text-cyan-700" />
                    {job.city}/{job.state}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge>{job.contractType}</Badge>
                    <Badge>{job.workMode}</Badge>
                  </div>
                </div>
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-[8px] bg-slate-950 px-4 text-sm font-semibold text-white"
                  href={`/vagas/${job.id}`}
                >
                  Ver detalhes
                </Link>
              </div>
            </article>
          ))
        ) : (
          <div className="soft-card rounded-[8px] p-8 text-slate-600">
            <Search className="mb-3 text-cyan-700" size={24} />
            <p className="font-semibold text-slate-950">Nenhuma vaga encontrada.</p>
            <p className="mt-1 text-sm text-slate-500">
              Ajuste os filtros ou volte mais tarde para novas oportunidades.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function Badge({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
      {children}
    </span>
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
