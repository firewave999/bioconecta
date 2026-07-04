import Link from "next/link";

import { CompanyJobsClient } from "./company-jobs-client";

export const metadata = {
  title: "Vagas da empresa",
};

export default function CompanyJobsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link className="text-sm font-semibold text-cyan-800" href="/dashboard">
          Voltar ao dashboard
        </Link>
        <div className="mt-8">
          <CompanyJobsClient />
        </div>
      </div>
    </main>
  );
}
