import Link from "next/link";

import { NotificationsClient } from "./notifications-client";

export const metadata = {
  title: "Notificacoes",
};

export default function NotificationsPage() {
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link className="text-sm font-semibold text-cyan-800" href="/dashboard">
            Voltar ao dashboard
          </Link>
          <Link className="text-sm font-semibold text-slate-700" href="/">
            BioConecta
          </Link>
        </div>
        <section className="page-header my-8 rounded-[8px] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">Central</p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-950">Notificacoes</h1>
          <p className="mt-2 text-slate-600">
            Avisos de candidatura, retorno de empresas e atualizacoes importantes.
          </p>
        </section>
        <NotificationsClient />
      </div>
    </main>
  );
}
