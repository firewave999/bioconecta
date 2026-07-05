import Link from "next/link";

import { ApplicationsClient } from "./applications-client";

export const metadata = {
  title: "Minhas candidaturas",
};

export default function ApplicationsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link className="text-sm font-semibold text-cyan-800" href="/dashboard">
          Voltar ao dashboard
        </Link>
        <div className="my-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Candidaturas
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-950">Minhas candidaturas</h1>
        </div>
        <ApplicationsClient />
      </div>
    </main>
  );
}
