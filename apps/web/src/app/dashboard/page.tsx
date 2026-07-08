import Link from "next/link";

import { DashboardClient } from "./dashboard-client";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <main className="app-shell min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link className="text-sm font-semibold text-cyan-800" href="/">
            BioConecta
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
            <Link href="/vagas">Vagas</Link>
            <Link href="/notificacoes">Notificacoes</Link>
            <Link href="/">Home</Link>
          </nav>
        </div>
        <div className="mt-8">
          <DashboardClient />
        </div>
      </div>
    </main>
  );
}
