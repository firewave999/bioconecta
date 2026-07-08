import Link from "next/link";
import { Suspense } from "react";

import { VerifyEmailClient } from "./verify-email-client";

export const metadata = {
  title: "Verificar e-mail",
};

export default function VerifyEmailPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="text-white">
        <Link className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200" href="/">
          Voltar para home
        </Link>
        <h1 className="mt-8 max-w-xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          Confirme seu e-mail.
        </h1>
        <p className="mt-5 max-w-lg text-lg leading-8 text-slate-200">
          A verificacao ajuda a proteger sua conta e melhora a confiabilidade dos perfis.
        </p>
      </section>

      <Suspense fallback={<section className="form-card rounded-[8px] p-6">Carregando...</section>}>
        <VerifyEmailClient />
      </Suspense>
    </main>
  );
}
