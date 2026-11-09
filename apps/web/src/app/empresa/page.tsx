import { CompanyForm } from "@/components/company/company-form";
import { CompanyWorkspaceHeader } from "@/components/company/company-workspace-header";

export const metadata = {
  title: "Empresa",
};

export default function CompanyPage() {
  return (
    <main className="page-shell">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10">
        <CompanyWorkspaceHeader
          active="company"
          eyebrow="Empresa"
          title="Configure sua operação de recrutamento."
        />
        <CompanyForm />
      </div>
    </main>
  );
}
