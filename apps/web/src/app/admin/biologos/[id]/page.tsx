import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AdminBiologistProfileClient } from "./profile-client";

export const metadata = {
  title: "Perfil do biologo",
};

export default function AdminBiologistProfilePage() {
  return (
    <main className="page-shell">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-800"
            href="/admin#biologos"
          >
            <ArrowLeft size={16} />
            Voltar para admin
          </Link>
          <Link className="text-sm font-semibold text-slate-700" href="/dashboard">
            Dashboard
          </Link>
        </div>
        <AdminBiologistProfileClient />
      </div>
    </main>
  );
}
