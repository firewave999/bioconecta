import { ProfessionalProfileForm } from "@/components/biologist/professional-profile-form";
import { ProfileWorkspaceHeader } from "@/components/biologist/profile-workspace-header";

export const metadata = {
  title: "Perfil profissional",
};

export default function ProfessionalProfilePage() {
  return (
    <main className="page-shell">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-10">
        <ProfileWorkspaceHeader
          active="professional"
          eyebrow="Perfil profissional"
          title="Especialidades, documentos e histórico técnico."
        />
        <ProfessionalProfileForm />
      </div>
    </main>
  );
}
