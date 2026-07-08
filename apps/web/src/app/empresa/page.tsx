import Link from "next/link";

import { CompanyForm } from "@/components/company/company-form";

export const metadata = {
  title: "Empresa",
};

export default function CompanyPage() {
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
        <div className="mt-8">
          <CompanyForm />
        </div>
      </div>
    </main>
  );
}
