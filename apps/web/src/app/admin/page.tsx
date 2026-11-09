import Link from "next/link";
import Image from "next/image";

import { AdminClient } from "./admin-client";

export const metadata = {
  title: "Admin",
};

export default function AdminPage() {
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link className="text-sm font-semibold text-cyan-800" href="/">
            BioConecta
          </Link>
          <Link className="text-sm font-semibold text-slate-700" href="/dashboard">
            Voltar ao dashboard
          </Link>
        </div>
        <section className="page-header mt-8 overflow-hidden rounded-[8px]">
          <div className="grid lg:grid-cols-[1fr_0.82fr]">
            <div className="p-6 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                Admin
              </p>
              <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                Painel operacional BioConecta.
              </h1>
              <p className="mt-4 max-w-3xl text-slate-600">
                Validacao de empresas, biólogos, vagas e acompanhamento rapido da plataforma.
              </p>
              <nav className="mt-6 flex flex-wrap gap-2 text-sm font-semibold text-slate-700">
                {[
                  ["#visao-geral", "Visao geral"],
                  ["#pendencias", "Pendencias"],
                  ["#empresas", "Empresas"],
                  ["#biologos", "Biólogos"],
                  ["#vagas", "Vagas"],
                  ["#candidaturas", "Candidaturas"],
                  ["#auditoria", "Auditoria"],
                ].map(([href, label]) => (
                  <a
                    className="rounded-full border border-cyan-100 bg-white/70 px-3 py-2 hover:border-cyan-300 hover:text-cyan-800"
                    href={href}
                    key={href}
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>
            <div className="relative min-h-[300px] bg-slate-950">
              <Image
                alt="Painel operacional ambiental com dados de candidatos e vagas."
                className="object-cover opacity-82"
                fill
                priority
                sizes="(min-width: 1024px) 42vw, 100vw"
                src="/images/company-hiring-premium.png"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.82))]" />
            </div>
          </div>
        </section>
        <div className="mt-6">
          <AdminClient />
        </div>
      </div>
    </main>
  );
}
