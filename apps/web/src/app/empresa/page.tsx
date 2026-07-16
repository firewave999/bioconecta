import Link from "next/link";

import { CompanyForm } from "@/components/company/company-form";

export const metadata = {
  title: "Empresa",
};

export default function CompanyPage() {
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-[8px] px-4 py-3">
          <Link className="text-sm font-semibold text-cyan-800" href="/dashboard">
            Voltar ao dashboard
          </Link>
          <Link className="text-sm font-bold tracking-[0.12em] text-slate-900" href="/">
            BIOCONECTA
          </Link>
        </div>
        <div className="mt-8">
          <CompanyForm />
        </div>
      </div>
    </main>
  );
}
