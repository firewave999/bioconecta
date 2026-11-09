import { ArrowLeft, Building2, FilePlus2, ListChecks, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type CompanyWorkspaceHeaderProps = {
  active: "biologists" | "company" | "jobs";
  eyebrow: string;
  title: string;
};

export function CompanyWorkspaceHeader({ active, eyebrow, title }: CompanyWorkspaceHeaderProps) {
  return (
    <section className="glass-panel overflow-hidden rounded-[8px]">
      <div className="grid lg:grid-cols-[1fr_0.9fr]">
        <div className="p-6 md:p-8">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-800"
            href="/dashboard"
          >
            <ArrowLeft size={16} />
            Voltar ao dashboard
          </Link>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            Organize dados da empresa, publique vagas e acompanhe candidatos em um fluxo separado da
            conta pessoal.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <CompanyTab
              active={active === "company"}
              href="/empresa"
              icon={<Building2 size={17} />}
            >
              Dados da empresa
            </CompanyTab>
            <CompanyTab
              active={active === "jobs"}
              href="/empresa/vagas"
              icon={<ListChecks size={17} />}
            >
              Vagas
            </CompanyTab>
            <CompanyTab
              active={active === "biologists"}
              href="/empresa/biologos"
              icon={<UsersRound size={17} />}
            >
              Biólogos
            </CompanyTab>
            <CompanyTab active={false} href="/empresa/vagas/nova" icon={<FilePlus2 size={17} />}>
              Nova vaga
            </CompanyTab>
          </div>
        </div>

        <div className="relative min-h-[330px] overflow-hidden bg-slate-950">
          <Image
            alt="Equipe ambiental avaliando candidatos e mapas tecnicos."
            className="object-cover opacity-84"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            src="/images/company-hiring-premium.png"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.04),rgba(2,6,23,0.82))]" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              Operacao empresa
            </p>
            <p className="mt-2 max-w-md text-xl font-semibold">
              Requisitos claros, candidatos qualificados e contato direto.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CompanyTab({
  active,
  children,
  href,
  icon,
}: {
  active: boolean;
  children: ReactNode;
  href: string;
  icon: ReactNode;
}) {
  return (
    <Link
      className={`inline-flex items-center gap-2 rounded-[8px] px-4 py-3 text-sm font-semibold transition ${
        active
          ? "bg-slate-950 text-white shadow-lg shadow-slate-950/20"
          : "border border-cyan-100 bg-white/72 text-slate-700 hover:border-cyan-300 hover:text-cyan-800"
      }`}
      href={href}
    >
      {icon}
      {children}
    </Link>
  );
}
