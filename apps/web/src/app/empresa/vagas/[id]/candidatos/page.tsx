import { CompanyWorkspaceHeader } from "@/components/company/company-workspace-header";
import { CandidatesClient } from "./candidates-client";

export const metadata = {
  title: "Candidatos da vaga",
};

export default function CandidatesPage() {
  return (
    <main className="page-shell">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10">
        <CompanyWorkspaceHeader
          active="jobs"
          eyebrow="Candidatos"
          title="Análise matches e avance o funil."
        />
        <CandidatesClient />
      </div>
    </main>
  );
}
