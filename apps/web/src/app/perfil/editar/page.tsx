import Link from "next/link";

import { BiologistProfileForm } from "@/components/biologist/biologist-profile-form";

export const metadata = {
  title: "Editar perfil",
};

export default function EditProfilePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link className="text-sm font-semibold text-cyan-800" href="/dashboard">
          Voltar ao dashboard
        </Link>
        <div className="mt-8">
          <BiologistProfileForm mode="edit" />
        </div>
      </div>
    </main>
  );
}
