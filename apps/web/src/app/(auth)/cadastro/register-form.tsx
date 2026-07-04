"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
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
  const [result, setResult] = useState<RegisterResponse | null>(null);
  const [verificationToken, setVerificationToken] = useState("");
  const [verified, setVerified] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);

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
          role: form.get("role"),
        },
      );

      localStorage.setItem("bioconecta.accessToken", response.tokens.accessToken);
      localStorage.setItem("bioconecta.refreshToken", response.tokens.refreshToken);
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
    <section className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/10">
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

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Tipo de conta
          <select
            className="h-11 rounded-[8px] border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-cyan-500"
            name="role"
            required
          >
            <option value="BIOLOGIST">Biologo</option>
            <option value="STUDENT">Estudante</option>
            <option value="COMPANY">Empresa</option>
          </select>
        </label>

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
      <input
        className="h-11 rounded-[8px] border border-slate-300 px-3 text-slate-950 outline-none focus:border-cyan-500"
        name={name}
        type={type}
        {...props}
      />
    </label>
  );
}
