import { BiologistProfileForm } from "@/components/biologist/biologist-profile-form";
import { ProfileWorkspaceHeader } from "@/components/biologist/profile-workspace-header";

export const metadata = {
  title: "Editar perfil",
};

export default function EditProfilePage() {
  return (
    <main className="page-shell">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10">
        <ProfileWorkspaceHeader
          active="basic"
          eyebrow="Perfil básico"
          title="Atualize sua identidade profissional."
        />
        <BiologistProfileForm mode="edit" />
      </div>
    </main>
  );
}
