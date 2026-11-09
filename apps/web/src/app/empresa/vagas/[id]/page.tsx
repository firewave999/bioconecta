import { CompanyWorkspaceHeader } from "@/components/company/company-workspace-header";
import { EditJobClient } from "./edit-job-client";

export const metadata = {
  title: "Editar vaga",
};

export default function EditJobPage() {
  return (
    <main className="page-shell">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-10">
        <CompanyWorkspaceHeader
          active="jobs"
          eyebrow="Editar vaga"
          title="Ajuste os requisitos da vaga."
        />
        <EditJobClient />
      </div>
    </main>
  );
}
