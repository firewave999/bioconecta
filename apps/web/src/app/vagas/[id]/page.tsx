import Link from "next/link";

import { JobDetailClient } from "./job-detail-client";

export const metadata = {
  title: "Detalhe da vaga",
};

export default function JobDetailPage() {
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link className="text-sm font-semibold text-cyan-800" href="/vagas">
            Voltar para vagas
          </Link>
          <Link className="text-sm font-semibold text-slate-700" href="/dashboard">
            Dashboard
          </Link>
        </div>
        <div className="mt-8">
          <JobDetailClient />
        </div>
      </div>
    </main>
  );
}
