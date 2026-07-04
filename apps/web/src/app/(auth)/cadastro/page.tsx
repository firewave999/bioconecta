import Link from "next/link";

import { RegisterForm } from "./register-form";

export const metadata = {
  title: "Criar conta",
};

export default function RegisterPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="text-white">
        <Link className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200" href="/">
          BioConecta
        </Link>
        <h1 className="mt-8 max-w-xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          Crie sua conta para acessar oportunidades da Biologia.
        </h1>
        <p className="mt-5 max-w-lg text-slate-200">
          Nesta etapa, a conta ja nasce integrada ao backend real com senha hasheada, sessao,
          refresh token e verificacao de e-mail em ambiente de desenvolvimento.
        </p>
      </section>

      <RegisterForm />
    </main>
  );
}
