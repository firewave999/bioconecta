import Link from "next/link";

import { BiologistProfileForm } from "@/components/biologist/biologist-profile-form";

export const metadata = {
  title: "Onboarding do biologo",
};

export default function BiologistOnboardingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link className="text-sm font-semibold text-cyan-800" href="/">
          BioConecta
        </Link>
        <div className="mt-8">
          <BiologistProfileForm mode="onboarding" />
        </div>
      </div>
    </main>
  );
}
