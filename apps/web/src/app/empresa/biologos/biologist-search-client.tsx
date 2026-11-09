"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { BadgeCheck, MapPin, Search } from "lucide-react";

import { VerificationBadge } from "@/components/biologist/verification-badge";
import { Button } from "@/components/ui/button";
import { apiFetch, getStoredAccessToken } from "@/lib/api";

type Biologist = {
  acceptsTravel: boolean;
  availabilityStatus: string;
  avatarUrl: string | null;
  city: string;
  fullName: string;
  hasCnpj: boolean;
  hasDriverLicense: boolean;
  hasOwnVehicle: boolean;
  headline: string | null;
  id: string;
  issuesInvoice: boolean;
  practiceAreas: string[];
  state: string;
  verificationStatus: string;
};

// Nomes exatos do catálogo de áreas de atuação, para o filtro bater com os dados.
const practiceAreaOptions = [
  "Licenciamento ambiental",
  "Inventario de fauna",
  "Inventario de flora",
  "Resgate de fauna",
  "Monitoramento ambiental",
  "Educacao ambiental",
  "Geoprocessamento",
  "Analise de dados ecologicos",
];

const flagFilters: Array<{ key: FlagKey; label: string }> = [
  { key: "verifiedOnly", label: "Apenas CRBio verificado" },
  { key: "availableNow", label: "Disponível agora" },
  { key: "hasDriverLicense", label: "Possui CNH" },
  { key: "hasOwnVehicle", label: "Possui veículo" },
  { key: "acceptsTravel", label: "Aceita viagens" },
  { key: "hasCnpj", label: "Possui CNPJ" },
  { key: "issuesInvoice", label: "Emite nota fiscal" },
];

type FlagKey =
  | "acceptsTravel"
  | "availableNow"
  | "hasCnpj"
  | "hasDriverLicense"
  | "hasOwnVehicle"
  | "issuesInvoice"
  | "verifiedOnly";

type Filters = {
  city: string;
  practiceArea: string;
  state: string;
} & Record<FlagKey, boolean>;

const emptyFilters: Filters = {
  acceptsTravel: false,
  availableNow: false,
  city: "",
  hasCnpj: false,
  hasDriverLicense: false,
  hasOwnVehicle: false,
  issuesInvoice: false,
  practiceArea: "",
  state: "",
  verifiedOnly: false,
};

function buildQuery(filters: Filters) {
  const params = new URLSearchParams();

  if (filters.state.trim()) params.set("state", filters.state.trim().toUpperCase());
  if (filters.city.trim()) params.set("city", filters.city.trim());
  if (filters.practiceArea) params.set("practiceArea", filters.practiceArea);

  for (const { key } of flagFilters) {
    if (filters[key]) params.set(key, "true");
  }

  return params.size ? `?${params.toString()}` : "";
}

export function BiologistSearchClient() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [biologists, setBiologists] = useState<Biologist[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (nextFilters: Filters) => {
    const token = getStoredAccessToken();

    if (!token) {
      setError("Você precisa entrar como empresa para buscar biólogos.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch<{ biologists: Biologist[] }>(
        `/biologist-profile/search${buildQuery(nextFilters)}`,
        { token },
      );
      setBiologists(response.biologists);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível buscar biólogos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(emptyFilters);
  }, [load]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void load(filters);
  }

  function toggle(key: FlagKey) {
    setFilters((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <form
        className="form-card grid h-fit gap-5 rounded-[8px] p-6"
        onSubmit={handleSubmit}
      >
        <div>
          <p className="font-semibold text-slate-950">Filtrar biólogos</p>
          <p className="mt-1 text-sm text-slate-500">Combine localização, área e requisitos.</p>
        </div>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Estado
          <input
            className="rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-sm uppercase"
            maxLength={2}
            onChange={(event) => setFilters({ ...filters, state: event.target.value })}
            placeholder="MG"
            value={filters.state}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Cidade
          <input
            className="rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-sm"
            onChange={(event) => setFilters({ ...filters, city: event.target.value })}
            placeholder="Belo Horizonte"
            value={filters.city}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Área de atuação
          <select
            className="rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-sm"
            onChange={(event) => setFilters({ ...filters, practiceArea: event.target.value })}
            value={filters.practiceArea}
          >
            <option value="">Todas</option>
            {practiceAreaOptions.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="grid gap-3">
          <legend className="mb-1 text-sm font-medium text-slate-700">Requisitos</legend>
          {flagFilters.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 text-sm text-slate-700">
              <input
                checked={filters[key]}
                className="h-4 w-4 accent-cyan-700"
                onChange={() => toggle(key)}
                type="checkbox"
              />
              {label}
            </label>
          ))}
        </fieldset>

        <Button type="submit">
          <Search size={16} />
          Buscar biólogos
        </Button>
      </form>

      <section className="grid content-start gap-4">
        {error ? (
          <p className="rounded-[8px] bg-rose-50 p-4 text-sm text-rose-800">{error}</p>
        ) : null}

        {loading ? <p className="text-sm text-slate-500">Buscando biólogos...</p> : null}

        {!loading && !error && biologists.length === 0 ? (
          <div className="soft-card rounded-[8px] p-8 text-center">
            <p className="font-semibold text-slate-950">Nenhum biólogo com esses filtros.</p>
            <p className="mt-2 text-sm text-slate-600">
              Tente remover algum requisito ou ampliar a localização.
            </p>
          </div>
        ) : null}

        {biologists.map((biologist) => (
          <article key={biologist.id} className="soft-card rounded-[8px] p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              {biologist.avatarUrl ? (
                <img
                  alt={`Foto de ${biologist.fullName}`}
                  className="h-16 w-16 rounded-full border border-slate-200 bg-white object-cover"
                  src={biologist.avatarUrl}
                />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-50 text-cyan-800">
                  <BadgeCheck size={24} />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-slate-950">{biologist.fullName}</h2>
                  <VerificationBadge status={biologist.verificationStatus} />
                </div>
                <p className="mt-1 text-slate-600">{biologist.headline ?? "Sem headline"}</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={15} />
                  {biologist.city}/{biologist.state}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {biologist.hasDriverLicense ? <Tag>CNH</Tag> : null}
                  {biologist.hasOwnVehicle ? <Tag>Veículo</Tag> : null}
                  {biologist.hasCnpj ? <Tag>CNPJ</Tag> : null}
                  {biologist.issuesInvoice ? <Tag>Nota fiscal</Tag> : null}
                  {biologist.acceptsTravel ? <Tag>Viaja</Tag> : null}
                  {biologist.availabilityStatus === "AVAILABLE_NOW" ? (
                    <Tag tone="accent">Disponível agora</Tag>
                  ) : null}
                </div>

                {biologist.practiceAreas.length ? (
                  <p className="mt-4 text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">Áreas: </span>
                    {biologist.practiceAreas.join(", ")}
                  </p>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function Tag({ children, tone = "neutral" }: { children: string; tone?: "accent" | "neutral" }) {
  const className =
    tone === "accent"
      ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
      : "bg-cyan-50 text-cyan-800 ring-cyan-100";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${className}`}>
      {children}
    </span>
  );
}
