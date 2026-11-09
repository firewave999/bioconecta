import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";
import { RegisterForm } from "./register-form";

export const metadata = {
  title: "Criar conta",
};

export default function RegisterPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr]">
      <AuthVisualPanel
        body="Biólogos, estudantes e empresas entram por fluxos separados, cada um com as ações certas para vagas, candidaturas e verificação."
        eyebrow="Cadastro"
        image="hero"
        title="Crie sua conta e complete seu perfil profissional."
      />

      <RegisterForm />
    </main>
  );
}
