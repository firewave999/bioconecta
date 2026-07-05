import Link from "next/link";

import { CandidatesClient } from "./candidates-client";

export const metadata = {
  title: "Candidatos da vaga",
};

export default function CandidatesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link className="text-sm font-semibold text-cyan-800" href="/empresa/vagas">
          Voltar para vagas da empresa
        </Link>
        <div className="mt-8">
          <CandidatesClient />
        </div>
      </div>
    </main>
  );
}
