import { BiologistProfileForm } from "@/components/biologist/biologist-profile-form";
import { ProfileWorkspaceHeader } from "@/components/biologist/profile-workspace-header";

export const metadata = {
  title: "Onboarding do biólogo",
};

export default function BiologistOnboardingPage() {
  return (
    <main className="page-shell">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-10">
        <ProfileWorkspaceHeader
          active="basic"
          eyebrow="Onboarding"
          title="Monte a base do seu perfil profissional."
        />
        <BiologistProfileForm mode="onboarding" />
      </div>
    </main>
  );
}
