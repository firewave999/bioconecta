import Link from "next/link";

import { JobsClient } from "./jobs-client";

export const metadata = {
  title: "Vagas",
};

export default function JobsPage() {
  return (
    <main className="app-shell min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link className="text-sm font-semibold text-cyan-800" href="/">
            BioConecta
          </Link>
          <Link className="text-sm font-semibold text-slate-600" href="/dashboard">
            Dashboard
          </Link>
        </div>
        <div className="page-header my-8 overflow-hidden rounded-[8px] p-7">
          <div className="premium-divider mb-6" />
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Oportunidades
          </p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight text-slate-950">
            Radar de oportunidades
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Filtre vagas por local, contrato, modalidade e requisito tecnico. O objetivo e encontrar
            oportunidades alinhadas ao perfil profissional, nao apenas listar anuncios.
          </p>
        </div>
        <JobsClient />
      </div>
    </main>
  );
}
