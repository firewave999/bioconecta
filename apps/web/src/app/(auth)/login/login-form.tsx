"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";

type LoginResponse = {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: {
    email: string;
    firstName: string;
  };
};

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);

    try {
      const response = await apiRequest<LoginResponse, Record<string, unknown>>("/auth/login", {
        email: form.get("email"),
        password: form.get("password"),
      });

      localStorage.setItem("bioconecta.accessToken", response.tokens.accessToken);
      localStorage.setItem("bioconecta.refreshToken", response.tokens.refreshToken);
      setSuccess(`Login realizado para ${response.user.email}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/10">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">Login</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Acesse sua conta</h2>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          E-mail
          <input
            className="h-11 rounded-[8px] border border-slate-300 px-3 text-slate-950 outline-none focus:border-cyan-500"
            name="email"
            required
            type="email"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Senha
          <input
            className="h-11 rounded-[8px] border border-slate-300 px-3 text-slate-950 outline-none focus:border-cyan-500"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </label>

        {error ? <p className="rounded-[8px] bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        {success ? (
          <p className="rounded-[8px] bg-cyan-50 p-3 text-sm text-cyan-800">{success}</p>
        ) : null}

        <Button disabled={loading} type="submit">
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="mt-5 text-sm text-slate-600">
        Ainda nao tem conta?{" "}
        <Link className="font-semibold text-cyan-800" href="/cadastro">
          Criar conta
        </Link>
      </p>
    </section>
  );
}
