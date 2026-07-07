import Link from "next/link";

import { EditJobClient } from "./edit-job-client";

export const metadata = {
  title: "Editar vaga",
};

export default function EditJobPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link className="text-sm font-semibold text-cyan-800" href="/empresa/vagas">
          Voltar para vagas
        </Link>
        <div className="mt-8">
          <EditJobClient />
        </div>
      </div>
    </main>
  );
}
