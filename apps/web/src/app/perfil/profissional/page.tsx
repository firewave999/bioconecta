import Link from "next/link";

import { ProfessionalProfileForm } from "@/components/biologist/professional-profile-form";

export const metadata = {
  title: "Perfil profissional",
};

export default function ProfessionalProfilePage() {
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link className="text-sm font-semibold text-cyan-800" href="/dashboard">
            Voltar ao dashboard
          </Link>
          <Link className="text-sm font-semibold text-slate-700" href="/perfil/editar">
            Perfil basico
          </Link>
        </div>
        <div className="mt-8">
          <ProfessionalProfileForm />
        </div>
      </div>
    </main>
  );
}
