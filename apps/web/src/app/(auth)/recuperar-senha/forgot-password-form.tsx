"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);

    try {
      await apiRequest<{ success: boolean }, Record<string, unknown>>("/auth/forgot-password", {
        email: form.get("email"),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel solicitar recuperacao.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="form-card rounded-[8px] p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">Senha</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Recuperar senha</h2>
      </div>

      {success ? (
        <div className="grid gap-4 rounded-[8px] border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900">
          <p>
            Se o e-mail existir na plataforma, enviamos um link de redefinicao. Confira sua caixa de
            entrada e spam.
          </p>
          <Button asChild variant="secondary">
            <Link href="/login">Voltar ao login</Link>
          </Button>
        </div>
      ) : (
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
          {error ? (
            <p className="rounded-[8px] bg-red-50 p-3 text-sm text-red-700">{error}</p>
          ) : null}
          <Button disabled={loading} type="submit">
            {loading ? "Enviando..." : "Enviar link de recuperacao"}
          </Button>
        </form>
      )}
    </section>
  );
}
