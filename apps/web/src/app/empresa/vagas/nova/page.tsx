import Link from "next/link";

import { JobForm } from "@/components/jobs/job-form";

export const metadata = {
  title: "Nova vaga",
};

export default function NewJobPage() {
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link className="text-sm font-semibold text-cyan-800" href="/empresa/vagas">
            Voltar para vagas
          </Link>
          <Link className="text-sm font-semibold text-slate-700" href="/dashboard">
            Dashboard
          </Link>
        </div>
        <div className="mt-8">
          <JobForm />
        </div>
      </div>
    </main>
  );
}
