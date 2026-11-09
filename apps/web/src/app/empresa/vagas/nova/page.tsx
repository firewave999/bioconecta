import { CompanyWorkspaceHeader } from "@/components/company/company-workspace-header";
import { JobForm } from "@/components/jobs/job-form";

export const metadata = {
  title: "Nova vaga",
};

export default function NewJobPage() {
  return (
    <main className="page-shell">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-10">
        <CompanyWorkspaceHeader active="jobs" eyebrow="Nova vaga" title="Crie uma vaga completa." />
        <JobForm />
      </div>
    </main>
  );
}
