import { Bell, BriefcaseBusiness, Home, Search } from "lucide-react";
import Link from "next/link";

import { DashboardClient } from "./dashboard-client";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <main className="app-shell min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-[8px] px-4 py-3">
          <Link className="text-sm font-bold tracking-[0.12em] text-cyan-800" href="/">
            BIOCONECTA
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600">
            <Link
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 hover:bg-cyan-50 hover:text-cyan-800"
              href="/vagas"
            >
              <Search size={16} />
              Vagas
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 hover:bg-cyan-50 hover:text-cyan-800"
              href="/notificacoes"
            >
              <Bell size={16} />
              Notificacoes
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 hover:bg-cyan-50 hover:text-cyan-800"
              href="/empresa/vagas"
            >
              <BriefcaseBusiness size={16} />
              Empresa
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 hover:bg-cyan-50 hover:text-cyan-800"
              href="/"
            >
              <Home size={16} />
              Home
            </Link>
          </nav>
        </div>
        <div className="mt-8">
          <DashboardClient />
        </div>
      </div>
    </main>
  );
}
