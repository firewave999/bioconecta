import { ArrowLeft, BadgeCheck, FileText, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type ProfileWorkspaceHeaderProps = {
  active: "basic" | "professional";
  eyebrow: string;
  title: string;
};

export function ProfileWorkspaceHeader({ active, eyebrow, title }: ProfileWorkspaceHeaderProps) {
  return (
    <section className="glass-panel overflow-hidden rounded-[8px]">
      <div className="grid lg:grid-cols-[1fr_0.92fr]">
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
            Mantenha seus dados, documentos e experiencias organizados para facilitar a avaliacao
            das empresas e melhorar a compatibilidade com vagas.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <ProfileTab
              active={active === "basic"}
              href="/perfil/editar"
              icon={<UserRound size={17} />}
            >
              Perfil basico
            </ProfileTab>
            <ProfileTab
              active={active === "professional"}
              href="/perfil/profissional"
              icon={<FileText size={17} />}
            >
              Perfil profissional
            </ProfileTab>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              ["Identidade", "Dados principais e foto."],
              ["Credenciais", "CRBio, certificados e anexos."],
              ["Experiencia", "Historico tecnico de campo."],
            ].map(([label, body]) => (
              <div key={label} className="rounded-[8px] border border-cyan-100 bg-white/72 p-4">
                <BadgeCheck size={18} className="text-cyan-700" />
                <p className="mt-3 font-semibold text-slate-950">{label}</p>
                <p className="mt-1 text-sm text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[360px] overflow-hidden bg-slate-950">
          <Image
            alt="Equipamentos de campo e painel digital de perfil profissional."
            className="object-cover opacity-82"
            fill
            priority
            sizes="(min-width: 1024px) 46vw, 100vw"
            src="/images/profile-field-premium.png"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.82))]" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              Perfil tecnico
            </p>
            <p className="mt-2 max-w-md text-xl font-semibold">
              Informacoes claras aumentam a confianca e reduzem atrito na contratacao.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfileTab({
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
