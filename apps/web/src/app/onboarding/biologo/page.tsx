import Link from "next/link";

import { BiologistProfileForm } from "@/components/biologist/biologist-profile-form";

export const metadata = {
  title: "Onboarding do biologo",
};

export default function BiologistOnboardingPage() {
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link className="text-sm font-semibold text-cyan-800" href="/dashboard">
            Voltar ao dashboard
          </Link>
          <Link className="text-sm font-semibold text-slate-700" href="/perfil/profissional">
            Perfil profissional
          </Link>
        </div>
        <div className="mt-8">
          <BiologistProfileForm mode="onboarding" />
        </div>
      </div>
    </main>
  );
}
