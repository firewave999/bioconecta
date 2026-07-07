import Link from "next/link";

import { NotificationsClient } from "./notifications-client";

export const metadata = {
  title: "Notificacoes",
};

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link className="text-sm font-semibold text-cyan-800" href="/dashboard">
          Voltar ao dashboard
        </Link>
        <div className="my-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">Central</p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-950">Notificacoes</h1>
        </div>
        <NotificationsClient />
      </div>
    </main>
  );
}
