import Link from "next/link";

import { AdminClient } from "./admin-client";

export const metadata = {
  title: "Admin",
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link className="text-sm font-semibold text-cyan-800" href="/">
            BioConecta
          </Link>
          <Link className="text-sm font-semibold text-slate-700" href="/dashboard">
            Voltar ao dashboard
          </Link>
        </div>
        <section className="mt-8 rounded-[8px] border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Painel operacional</h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            Validacao de empresas, biologos, vagas e acompanhamento rapido da plataforma.
          </p>
        </section>
        <div className="mt-6">
          <AdminClient />
        </div>
      </div>
    </main>
  );
}
