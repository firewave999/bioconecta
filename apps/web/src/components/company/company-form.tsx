"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { apiFetch, getStoredAccessToken } from "@/lib/api";

type Company = {
  city: string;
  cnpj: string;
  description: string | null;
  name: string;
  size: "SOLO" | "SMALL" | "MEDIUM" | "LARGE";
  state: string;
  website: string | null;
};

export function CompanyForm() {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getStoredAccessToken();

    if (!token) {
      router.push("/login");
      return;
    }

    apiFetch<{ company: Company | null }>("/companies/me", { token })
      .then((response) => setCompany(response.company))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Nao foi possivel carregar a empresa."),
      );
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const token = getStoredAccessToken();

    if (!token) {
      router.push("/login");
      return;
    }

    const form = new FormData(event.currentTarget);

    try {
      await apiFetch<{ company: Company }, Record<string, unknown>>("/companies/me", {
        body: {
          city: form.get("city"),
          cnpj: form.get("cnpj"),
          description: form.get("description"),
          name: form.get("name"),
          size: form.get("size"),
          state: form.get("state"),
          website: form.get("website") || undefined,
        },
        method: "PUT",
        token,
      });

      router.push("/empresa/vagas");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel salvar a empresa.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="grid gap-5 rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">Empresa</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Dados da empresa</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field defaultValue={company?.name} label="Nome da empresa" name="name" required />
        <Field defaultValue={company?.cnpj} label="CNPJ" name="cnpj" required />
        <Field defaultValue={company?.website ?? ""} label="Site" name="website" type="url" />
        <Field defaultValue={company?.state} label="Estado" maxLength={2} name="state" required />
        <Field defaultValue={company?.city} label="Cidade" name="city" required />
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Porte
          <select
            className="h-11 rounded-[8px] border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-cyan-500"
            defaultValue={company?.size ?? "SMALL"}
            name="size"
          >
            <option value="SOLO">Profissional ou consultoria individual</option>
            <option value="SMALL">Pequena empresa</option>
            <option value="MEDIUM">Media empresa</option>
            <option value="LARGE">Grande empresa</option>
          </select>
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Descricao
        <textarea
          className="min-h-28 rounded-[8px] border border-slate-300 px-3 py-3 text-slate-950 outline-none focus:border-cyan-500"
          defaultValue={company?.description ?? ""}
          name="description"
        />
      </label>

      {error ? <p className="rounded-[8px] bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <Button disabled={loading} type="submit">
        {loading ? "Salvando..." : "Salvar empresa"}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  ...props
}: {
  defaultValue?: string;
  label: string;
  maxLength?: number;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <input
        className="h-11 rounded-[8px] border border-slate-300 px-3 text-slate-950 outline-none focus:border-cyan-500"
        name={name}
        type={type}
        {...props}
      />
    </label>
  );
}
