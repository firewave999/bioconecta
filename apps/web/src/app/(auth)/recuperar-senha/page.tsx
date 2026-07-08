import Link from "next/link";

import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = {
  title: "Recuperar senha",
};

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="text-white">
        <Link className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200" href="/">
          Voltar para home
        </Link>
        <h1 className="mt-8 max-w-xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          Recupere o acesso com seguranca.
        </h1>
        <p className="mt-5 max-w-lg text-lg leading-8 text-slate-200">
          Enviaremos um link para redefinir sua senha no e-mail cadastrado.
        </p>
      </section>

      <ForgotPasswordForm />
    </main>
  );
}
