import { Suspense } from "react";

import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata = {
  title: "Redefinir senha",
};

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr]">
      <AuthVisualPanel
        body="Use o link recebido por e-mail para proteger novamente sua conta."
        eyebrow="Nova senha"
        image="field"
        title="Defina uma nova senha."
      />

      <Suspense fallback={<section className="form-card rounded-[8px] p-6">Carregando...</section>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
