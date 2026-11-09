import { CompanyWorkspaceHeader } from "@/components/company/company-workspace-header";
import { CompanyJobsClient } from "./company-jobs-client";

export const metadata = {
  title: "Vagas da empresa",
};

export default function CompanyJobsPage() {
  return (
    <main className="page-shell">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10">
        <CompanyWorkspaceHeader
          active="jobs"
          eyebrow="Vagas da empresa"
          title="Gerencie publicações e candidatos."
        />
        <CompanyJobsClient />
      </div>
    </main>
  );
}
