import Link from "next/link";

import { CompanyJobsClient } from "./company-jobs-client";

export const metadata = {
  title: "Vagas da empresa",
};

export default function CompanyJobsPage() {
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link className="text-sm font-semibold text-cyan-800" href="/dashboard">
            Voltar ao dashboard
          </Link>
          <Link className="text-sm font-semibold text-slate-700" href="/empresa">
            Dados da empresa
          </Link>
        </div>
        <div className="mt-8">
          <CompanyJobsClient />
        </div>
      </div>
    </main>
  );
}
