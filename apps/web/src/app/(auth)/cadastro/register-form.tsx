"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmailVerificationNotice } from "@/components/auth/email-verification-notice";
import { apiRequest } from "@/lib/api";

type AuthTokens = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
};

type RegisterResponse = {
  devVerificationToken?: string;
  tokens: AuthTokens;
  user: {
    email: string;
    firstName: string;
    id: string;
  };
};

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registeredRole, setRegisteredRole] = useState<string | null>(null);
  const [result, setResult] = useState<RegisterResponse | null>(null);
  const [selectedRole, setSelectedRole] = useState("BIOLOGIST");
  const [verificationToken, setVerificationToken] = useState("");
  const [verified, setVerified] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const role = selectedRole;

    try {
      const response = await apiRequest<RegisterResponse, Record<string, unknown>>(
        "/auth/register",
        {
          acceptPrivacy: form.get("acceptPrivacy") === "on",
          acceptTerms: form.get("acceptTerms") === "on",
          email: form.get("email"),
          firstName: form.get("firstName"),
          lastName: form.get("lastName"),
          password: form.get("password"),
          phone: form.get("phone"),
          role,
        },
      );

      localStorage.setItem("bioconecta.accessToken", response.tokens.accessToken);
      localStorage.setItem("bioconecta.refreshToken", response.tokens.refreshToken);
      setRegisteredRole(role);
      setResult(response);
      setVerificationToken(response.devVerificationToken ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel criar a conta.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyEmail() {
    setError(null);
    setLoading(true);

    try {
      await apiRequest<{ verified: boolean }, Record<string, unknown>>("/auth/verify-email", {
        token: verificationToken,
      });
      setVerified(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel verificar o e-mail.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="form-card rounded-[8px] p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">Cadastro</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Dados da conta</h2>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" name="firstName" required />
          <Field label="Sobrenome" name="lastName" required />
        </div>
        <Field label="E-mail" name="email" required type="email" />
        <Field label="Telefone" name="phone" type="tel" />
        <Field label="Senha" minLength={8} name="password" required type="password" />

        <input name="role" type="hidden" value={selectedRole} />

        <fieldset className="grid gap-3">
          <legend className="text-sm font-medium text-slate-700">Tipo de conta</legend>
          <div className="grid gap-3 md:grid-cols-3">
            <RoleOption
              checked={selectedRole === "BIOLOGIST"}
              description="Para criar perfil profissional, buscar vagas e se candidatar."
              label="Biologo"
              onSelect={() => setSelectedRole("BIOLOGIST")}
            />
            <RoleOption
              checked={selectedRole === "STUDENT"}
              description="Para acompanhar vagas, favoritos e oportunidades para estudantes."
              label="Estudante"
              onSelect={() => setSelectedRole("STUDENT")}
            />
            <RoleOption
              checked={selectedRole === "COMPANY"}
              description="Para cadastrar empresa, publicar vagas e receber candidatos."
              label="Empresa"
              onSelect={() => setSelectedRole("COMPANY")}
            />
          </div>
        </fieldset>

        <label className="flex gap-3 text-sm text-slate-600">
          <input className="mt-1" name="acceptTerms" required type="checkbox" /> Aceito os termos de
          uso.
        </label>
        <label className="flex gap-3 text-sm text-slate-600">
          <input className="mt-1" name="acceptPrivacy" required type="checkbox" /> Aceito a politica
          de privacidade.
        </label>

        {error ? <p className="rounded-[8px] bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        <Button disabled={loading} type="submit">
          {loading ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>

      {result ? (
        <div className="mt-6 rounded-[8px] border border-cyan-200 bg-cyan-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-950">Conta criada para {result.user.email}</p>
          {result.devVerificationToken ? (
            <div className="mt-4 grid gap-3">
              <p>Token de verificacao em desenvolvimento:</p>
              <code className="break-all rounded-[6px] bg-white p-3 text-xs text-slate-800">
                {result.devVerificationToken}
              </code>
              <Button
                disabled={loading || verified}
                onClick={handleVerifyEmail}
                type="button"
                variant="secondary"
              >
                {verified ? "E-mail verificado" : "Verificar e-mail em dev"}
              </Button>
              {verified ? (
                <Button asChild>
                  <Link href={getNextPath(registeredRole)}>{getNextLabel(registeredRole)}</Link>
                </Button>
              ) : null}
            </div>
          ) : null}
          {!result.devVerificationToken ? (
            <div className="mt-4 grid gap-3">
              <p>
                Enviamos um link de verificacao para seu e-mail. Confira sua caixa de entrada antes
                de continuar.
              </p>
              <EmailVerificationNotice email={result.user.email} />
              <Button asChild>
                <Link href={getNextPath(registeredRole)}>{getNextLabel(registeredRole)}</Link>
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="mt-5 text-sm text-slate-600">
        Ja tem conta?{" "}
        <Link className="font-semibold text-cyan-800" href="/login">
          Entrar
        </Link>
      </p>
    </section>
  );
}

function RoleOption({
  checked,
  description,
  label,
  onSelect,
}: {
  checked: boolean;
  description: string;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      className={`rounded-[8px] border p-4 text-left transition ${
        checked
          ? "border-cyan-500 bg-cyan-50 shadow-sm shadow-cyan-950/5"
          : "border-slate-200 bg-white hover:border-cyan-300 hover:bg-cyan-50/40"
      }`}
      onClick={onSelect}
      type="button"
    >
      <span className="flex items-center gap-2 text-sm font-semibold text-slate-950">
        <span
          className={`h-3 w-3 rounded-full border ${
            checked ? "border-cyan-600 bg-cyan-600" : "border-slate-300 bg-white"
          }`}
        />
        {label}
      </span>
      <span className="mt-2 block text-sm leading-5 text-slate-600">{description}</span>
    </button>
  );
}

function getNextPath(role: string | null) {
  if (role === "COMPANY") {
    return "/empresa";
  }

  if (role === "STUDENT") {
    return "/dashboard";
  }

  return "/onboarding/biologo";
}

function getNextLabel(role: string | null) {
  if (role === "COMPANY") {
    return "Cadastrar empresa";
  }

  if (role === "STUDENT") {
    return "Ir para o dashboard";
  }

  return "Continuar onboarding de biologo";
}

function Field({
  label,
  name,
  type = "text",
  ...props
}: {
  label: string;
  minLength?: number;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <input className="field-input h-11 rounded-[8px] px-3" name={name} type={type} {...props} />
    </label>
  );
}
