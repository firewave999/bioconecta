import { CompanyWorkspaceHeader } from "@/components/company/company-workspace-header";
import { BiologistSearchClient } from "./biologist-search-client";

export const metadata = {
  title: "Buscar biólogos",
};

export default function EmpresaBiologistsPage() {
  return (
    <main className="page-shell">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10">
        <CompanyWorkspaceHeader
          active="biologists"
          eyebrow="Biólogos"
          title="Encontre profissionais por campo e requisito."
        />
        <BiologistSearchClient />
      </div>
    </main>
  );
}
