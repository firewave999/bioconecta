import Link from "next/link";

import { JobDetailClient } from "./job-detail-client";

export const metadata = {
  title: "Detalhe da vaga",
};

export default function JobDetailPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link className="text-sm font-semibold text-cyan-800" href="/vagas">
          Voltar para vagas
        </Link>
        <div className="mt-8">
          <JobDetailClient />
        </div>
      </div>
    </main>
  );
}
