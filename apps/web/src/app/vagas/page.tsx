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
        <div className="glass-panel my-8 rounded-[8px] p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Oportunidades
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            Vagas para biologos
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Filtre por local, contrato, modo de trabalho e requisito tecnico para encontrar vagas
            alinhadas ao seu perfil.
          </p>
        </div>
        <JobsClient />
      </div>
    </main>
  );
}
