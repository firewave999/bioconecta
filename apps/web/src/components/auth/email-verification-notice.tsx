"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";

type EmailVerificationNoticeProps = {
  email: string;
};

export function EmailVerificationNotice({ email }: EmailVerificationNoticeProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function resendVerificationEmail() {
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      await apiRequest<{ success: boolean }, Record<string, unknown>>(
        "/auth/resend-verification-email",
        { email },
      );
      setMessage("Enviamos um novo link de verificacao. Confira a caixa de entrada e o spam.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel reenviar o e-mail.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-[8px] border border-amber-200 bg-amber-50 p-5 text-amber-900">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-semibold">Confirme seu e-mail para liberar todas as acoes.</p>
          <p className="mt-1 text-sm text-amber-800">
            Enquanto o e-mail nao for confirmado, cadastro de empresa, edicao de perfil,
            candidaturas, uploads e publicacao de vagas ficam bloqueados por seguranca.
          </p>
          {message ? <p className="mt-3 text-sm font-medium text-emerald-800">{message}</p> : null}
          {error ? <p className="mt-3 text-sm font-medium text-red-700">{error}</p> : null}
        </div>
        <Button disabled={busy} onClick={resendVerificationEmail} type="button" variant="light">
          {busy ? "Reenviando..." : "Reenviar verificacao"}
        </Button>
      </div>
    </section>
  );
}
