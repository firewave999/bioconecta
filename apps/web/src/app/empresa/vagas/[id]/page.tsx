import Link from "next/link";

import { EditJobClient } from "./edit-job-client";

export const metadata = {
  title: "Editar vaga",
};

export default function EditJobPage() {
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
          <EditJobClient />
        </div>
      </div>
    </main>
  );
}
