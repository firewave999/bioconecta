"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { apiRequest, storeTokens } from "@/lib/api";

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
  const router = useRouter();
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

      storeTokens(response.tokens);
      setSuccess(`Login realizado para ${response.user.email}.`);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="form-card rounded-[8px] p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">Login</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Acesse sua conta</h2>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          E-mail
          <input
            className="field-input h-11 rounded-[8px] px-3"
            name="email"
            required
            type="email"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Senha
          <input
            className="field-input h-11 rounded-[8px] px-3"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </label>

        {error ? <p className="rounded-[8px] bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        {success ? (
          <div className="grid gap-3 rounded-[8px] bg-cyan-50 p-3 text-sm text-cyan-800">
            <p>{success}</p>
            <Link className="font-semibold text-cyan-900" href="/dashboard">
              Ir para dashboard
            </Link>
          </div>
        ) : null}

        <Button disabled={loading} type="submit">
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="mt-5 text-sm text-slate-600">
        <Link className="font-semibold text-cyan-800" href="/recuperar-senha">
          Esqueci minha senha
        </Link>
      </p>

      <p className="mt-3 text-sm text-slate-600">
        Ainda nao tem conta?{" "}
        <Link className="font-semibold text-cyan-800" href="/cadastro">
          Criar conta
        </Link>
      </p>
    </section>
  );
}
