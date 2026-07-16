import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr]">
      <AuthVisualPanel
        body="Acesse vagas, candidaturas, dados da empresa e fluxos administrativos em um ambiente mais organizado."
        eyebrow="Acesso"
        image="field"
        title="Entre no seu painel BioConecta."
      />

      <LoginForm />
    </main>
  );
}
