import Link from "next/link";
import Image from "next/image";

import { JobsClient } from "./jobs-client";

export const metadata = {
  title: "Vagas",
};

export default function JobsPage() {
  return (
    <main className="app-shell min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link className="text-sm font-semibold text-cyan-800" href="/">
            BioConecta
          </Link>
          <Link className="text-sm font-semibold text-slate-600" href="/dashboard">
            Dashboard
          </Link>
        </div>
        <section className="page-header my-8 overflow-hidden rounded-[8px]">
          <div className="grid lg:grid-cols-[1fr_0.82fr]">
            <div className="p-7 md:p-9">
              <div className="premium-divider mb-6" />
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                Oportunidades
              </p>
              <h1 className="mt-3 max-w-3xl text-5xl font-semibold tracking-tight text-slate-950">
                Radar de oportunidades ambientais.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Filtre vagas por local, contrato, modalidade e requisito técnico para encontrar
                oportunidades alinhadas ao seu perfil profissional.
              </p>
            </div>
            <div className="relative min-h-[280px] bg-slate-950">
              <Image
                alt="Equipe ambiental analisando vagas, mapas e dados técnicos."
                className="object-cover opacity-86"
                fill
                priority
                sizes="(min-width: 1024px) 42vw, 100vw"
                src="/images/company-hiring-premium.png"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.72))]" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                  Matching técnico
                </p>
                <p className="mt-2 text-lg font-semibold">
                  Vagas com requisitos claros e contexto de atuação.
                </p>
              </div>
            </div>
          </div>
        </section>
        <JobsClient />
      </div>
    </main>
  );
}
