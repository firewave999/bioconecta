import Link from "next/link";

import { CompanyForm } from "@/components/company/company-form";

export const metadata = {
  title: "Empresa",
};

export default function CompanyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link className="text-sm font-semibold text-cyan-800" href="/dashboard">
          Voltar ao dashboard
        </Link>
        <div className="mt-8">
          <CompanyForm />
        </div>
      </div>
    </main>
  );
}
