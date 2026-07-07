"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { apiFetch, getStoredAccessToken } from "@/lib/api";

const COMPANY_ROLES = ["COMPANY", "RECRUITER"];

type Company = {
  city: string;
  cnpj: string;
  description: string | null;
  name: string;
  size: "SOLO" | "SMALL" | "MEDIUM" | "LARGE";
  state: string;
  verificationNotes: string | null;
  verificationStatus: string;
  website: string | null;
};

type Account = {
  email: string;
  roles: string[];
};

export function CompanyForm() {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getStoredAccessToken();

    if (!token) {
      router.push("/login");
      return;
    }

    apiFetch<{ user: Account }>("/auth/me", { token })
      .then(async (me) => {
        setAccount(me.user);

        if (!canManageCompany(me.user.roles)) {
          return;
        }

        const response = await apiFetch<{ company: Company | null }>("/companies/me", { token });
        setCompany(response.company);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Nao foi possivel carregar a empresa."),
      )
      .finally(() => setInitialLoading(false));
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

    if (!account || !canManageCompany(account.roles)) {
      setLoading(false);
      setError("Esta conta nao tem permissao para cadastrar empresa.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const cnpj = onlyDigits(String(form.get("cnpj") ?? ""));

    if (cnpj.length !== 14) {
      setLoading(false);
      setError("Informe um CNPJ valido com 14 digitos.");
      return;
    }

    try {
      await apiFetch<{ company: Company }, Record<string, unknown>>("/companies/me", {
        body: {
          city: form.get("city"),
          cnpj,
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

  if (initialLoading) {
    return (
      <div className="rounded-[8px] border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
        Carregando dados da conta...
      </div>
    );
  }

  if (error && !account) {
    return (
      <section className="rounded-[8px] border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
        <p>{error}</p>
        <Button asChild className="mt-4">
          <Link href="/login">Ir para login</Link>
        </Button>
      </section>
    );
  }

  if (account && !canManageCompany(account.roles)) {
    return (
      <section className="rounded-[8px] border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-800">
          Acesso de empresa
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          Esta conta nao pode cadastrar empresa
        </h1>
        <p className="mt-3 text-slate-700">
          A conta {account.email} esta com o papel {account.roles.join(", ")}. Para cadastrar uma
          empresa, use uma conta do tipo empresa ou recrutador.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/cadastro">Criar conta empresa</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard">Voltar ao dashboard</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <form
      className="grid gap-5 rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">Empresa</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Dados da empresa</h1>
        {company ? (
          <div className="mt-3 grid gap-2">
            <p className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              Status: {getCompanyStatusLabel(company.verificationStatus)}
            </p>
            {company.verificationNotes ? (
              <p className="rounded-[8px] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Observacao do admin: {company.verificationNotes}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-slate-600">
            Preencha os dados juridicos para liberar a gestao de vagas da empresa.
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field defaultValue={company?.name} label="Nome da empresa" name="name" required />
        <Field
          defaultValue={company?.cnpj ? formatCnpj(company.cnpj) : ""}
          inputMode="numeric"
          label="CNPJ"
          maxLength={18}
          name="cnpj"
          placeholder="00.000.000/0000-00"
          required
        />
        <Field
          defaultValue={company?.website ?? ""}
          label="Site"
          name="website"
          placeholder="https://empresa.com.br"
          type="url"
        />
        <Field
          defaultValue={company?.state}
          label="Estado"
          maxLength={2}
          name="state"
          placeholder="SP"
          required
        />
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
          placeholder="Descreva a empresa, areas de atuacao e tipos de oportunidades oferecidas."
        />
      </label>

      {error ? <p className="rounded-[8px] bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <Button disabled={loading} type="submit">
        {loading ? "Salvando..." : "Salvar empresa"}
      </Button>
    </form>
  );
}

function canManageCompany(roles: string[]) {
  return roles.some((role) => COMPANY_ROLES.includes(role));
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatCnpj(value: string) {
  const digits = onlyDigits(value);

  if (digits.length !== 14) {
    return value;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(
    8,
    12,
  )}-${digits.slice(12)}`;
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

function Field({
  label,
  name,
  type = "text",
  ...props
}: {
  defaultValue?: string;
  inputMode?: "numeric";
  label: string;
  maxLength?: number;
  name: string;
  placeholder?: string;
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
