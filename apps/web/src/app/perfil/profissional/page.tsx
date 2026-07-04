import Link from "next/link";

import { ProfessionalProfileForm } from "@/components/biologist/professional-profile-form";

export const metadata = {
  title: "Perfil profissional",
};

export default function ProfessionalProfilePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link className="text-sm font-semibold text-cyan-800" href="/dashboard">
          Voltar ao dashboard
        </Link>
        <div className="mt-8">
          <ProfessionalProfileForm />
        </div>
      </div>
    </main>
  );
}
