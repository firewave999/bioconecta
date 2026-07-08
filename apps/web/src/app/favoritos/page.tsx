import Link from "next/link";

import { FavoritesClient } from "./favorites-client";

export const metadata = {
  title: "Favoritos",
};

export default function FavoritesPage() {
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link className="text-sm font-semibold text-cyan-800" href="/dashboard">
            Voltar ao dashboard
          </Link>
          <Link className="text-sm font-semibold text-slate-700" href="/vagas">
            Buscar vagas
          </Link>
        </div>
        <section className="page-header my-8 rounded-[8px] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Favoritos
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-950">Vagas salvas</h1>
          <p className="mt-2 text-slate-600">
            Guarde oportunidades para comparar requisitos, localidade e formato de contrato.
          </p>
        </section>
        <FavoritesClient />
      </div>
    </main>
  );
}
