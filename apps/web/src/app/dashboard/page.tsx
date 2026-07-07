import Link from "next/link";

import { DashboardClient } from "./dashboard-client";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link className="text-sm font-semibold text-cyan-800" href="/">
          Voltar para home
        </Link>
        <div className="mt-8">
          <DashboardClient />
        </div>
      </div>
    </main>
  );
}
