import Link from "next/link";

import { JobsClient } from "./jobs-client";

export const metadata = {
  title: "Vagas",
};

export default function JobsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link className="text-sm font-semibold text-cyan-800" href="/">
          Voltar para home
        </Link>
        <div className="my-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Oportunidades
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-950">Vagas para biologos</h1>
        </div>
        <JobsClient />
      </div>
    </main>
  );
}
