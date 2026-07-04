"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { apiFetch, getStoredAccessToken } from "@/lib/api";

export function JobForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      await apiFetch<{ job: unknown }, Record<string, unknown>>("/jobs", {
        body: {
          acceptsStudents: form.get("acceptsStudents") === "on",
          city: form.get("city"),
          contractType: form.get("contractType"),
          description: form.get("description"),
          requiredPracticeAreas: splitList(String(form.get("requiredPracticeAreas") ?? "")),
          requiredSkills: splitList(String(form.get("requiredSkills") ?? "")),
          requiredTaxonomicGroups: splitList(String(form.get("requiredTaxonomicGroups") ?? "")),
          requiresCrbio: form.get("requiresCrbio") === "on",
          requiresTravel: form.get("requiresTravel") === "on",
          salaryMaxCents: moneyToCents(String(form.get("salaryMax") ?? "")),
          salaryMinCents: moneyToCents(String(form.get("salaryMin") ?? "")),
          state: form.get("state"),
          status: form.get("status"),
          title: form.get("title"),
          workMode: form.get("workMode"),
        },
        method: "POST",
        token,
      });

      router.push("/empresa/vagas");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel criar a vaga.");
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
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">Vaga</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Criar vaga para biologos</h1>
      </div>

      <Field label="Titulo" name="title" required />
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Descricao da vaga
        <textarea
          className="min-h-32 rounded-[8px] border border-slate-300 px-3 py-3 text-slate-950 outline-none focus:border-cyan-500"
          name="description"
          required
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <Select
          label="Status"
          name="status"
          options={[
            ["DRAFT", "Rascunho"],
            ["PUBLISHED", "Publicada"],
          ]}
        />
        <Select
          label="Contrato"
          name="contractType"
          options={[
            ["CLT", "CLT"],
            ["PJ", "PJ"],
            ["FREELANCE", "Freelance"],
            ["INTERNSHIP", "Estagio"],
            ["TEMPORARY", "Temporario"],
          ]}
        />
        <Select
          label="Modo"
          name="workMode"
          options={[
            ["FIELD", "Campo"],
            ["ON_SITE", "Presencial"],
            ["HYBRID", "Hibrido"],
            ["REMOTE", "Remoto"],
          ]}
        />
        <Field label="Estado" maxLength={2} name="state" required />
        <Field label="Cidade" name="city" required />
        <Field label="Salario minimo" name="salaryMin" type="number" />
        <Field label="Salario maximo" name="salaryMax" type="number" />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Check defaultChecked label="Exige CRBio" name="requiresCrbio" />
        <Check label="Aceita estudantes" name="acceptsStudents" />
        <Check label="Exige viagem" name="requiresTravel" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <TextArea label="Areas exigidas" name="requiredPracticeAreas" />
        <TextArea label="Grupos taxonomicos" name="requiredTaxonomicGroups" />
        <TextArea label="Competencias" name="requiredSkills" />
      </div>

      {error ? <p className="rounded-[8px] bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <Button disabled={loading} type="submit">
        {loading ? "Criando..." : "Criar vaga"}
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

function Select({ label, name, options }: { label: string; name: string; options: string[][] }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <select
        className="h-11 rounded-[8px] border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-cyan-500"
        name={name}
      >
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

function Check({
  defaultChecked,
  label,
  name,
}: {
  defaultChecked?: boolean;
  label: string;
  name: string;
}) {
  return (
    <label className="flex items-center gap-3 rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
      <input defaultChecked={defaultChecked} name={name} type="checkbox" />
      {label}
    </label>
  );
}

function TextArea({ label, name }: { label: string; name: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <textarea
        className="min-h-24 rounded-[8px] border border-slate-300 px-3 py-3 text-slate-950 outline-none focus:border-cyan-500"
        name={name}
        placeholder="Separe por virgula"
      />
    </label>
  );
}

function splitList(value: string) {
  return [
    ...new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

function moneyToCents(value: string) {
  return value ? Math.round(Number(value) * 100) : undefined;
}
