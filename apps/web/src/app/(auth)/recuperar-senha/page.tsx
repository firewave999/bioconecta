import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = {
  title: "Recuperar senha",
};

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr]">
      <AuthVisualPanel
        body="Enviaremos um link para redefinir sua senha no e-mail cadastrado."
        eyebrow="Seguranca"
        image="field"
        title="Recupere o acesso com seguranca."
      />

      <ForgotPasswordForm />
    </main>
  );
}
