import { Suspense } from "react";

import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";
import { VerifyEmailClient } from "./verify-email-client";

export const metadata = {
  title: "Verificar e-mail",
};

export default function VerifyEmailPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr]">
      <AuthVisualPanel
        body="A verificacao ajuda a proteger sua conta e melhora a confiabilidade dos perfis."
        eyebrow="Verificacao"
        image="company"
        title="Confirme seu e-mail."
      />

      <Suspense fallback={<section className="form-card rounded-[8px] p-6">Carregando...</section>}>
        <VerifyEmailClient />
      </Suspense>
    </main>
  );
}
