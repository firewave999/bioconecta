import Link from "next/link";

import { JobForm } from "@/components/jobs/job-form";

export const metadata = {
  title: "Nova vaga",
};

export default function NewJobPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link className="text-sm font-semibold text-cyan-800" href="/empresa/vagas">
          Voltar para vagas
        </Link>
        <div className="mt-8">
          <JobForm />
        </div>
      </div>
    </main>
  );
}
