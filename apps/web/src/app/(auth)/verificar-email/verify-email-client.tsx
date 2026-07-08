"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";

export function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    apiRequest<{ verified: boolean }, Record<string, unknown>>("/auth/verify-email", { token })
      .then(() => setVerified(true))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Nao foi possivel verificar o e-mail."),
      )
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <section className="form-card rounded-[8px] p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Verificacao
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Status do e-mail</h2>
      </div>

      {!token ? (
        <div className="rounded-[8px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Link sem token de verificacao.
        </div>
      ) : loading ? (
        <p className="text-sm text-slate-600">Verificando e-mail...</p>
      ) : verified ? (
        <div className="grid gap-4 rounded-[8px] border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900">
          <p>E-mail verificado com sucesso.</p>
          <Button asChild variant="secondary">
            <Link href="/dashboard">Ir para dashboard</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 rounded-[8px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error ?? "Nao foi possivel verificar este e-mail."}</p>
          <Button asChild variant="secondary">
            <Link href="/login">Voltar ao login</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
