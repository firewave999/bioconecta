import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Microscope,
  Search,
  ShieldCheck,
  Sparkles,
  Sprout,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { HomeAuthActions } from "@/components/home/home-auth-actions";
import { Button } from "@/components/ui/button";

const recentJobs = [
  {
    company: "Consultoria Ambiental Cerrado Vivo",
    location: "Goiania, GO",
    mode: "Campanha de campo",
    title: "Biologo de Fauna - Mastofauna",
  },
  {
    company: "Instituto BioSul",
    location: "Curitiba, PR",
    mode: "PJ",
    title: "Analista de Licenciamento Ambiental",
  },
  {
    company: "EcoMonitor Brasil",
    location: "Belo Horizonte, MG",
    mode: "Diaria",
    title: "Auxiliar de Campo - Herpetofauna",
  },
];

const practiceAreas = [
  "Monitoramento de fauna",
  "Licenciamento ambiental",
  "Resgate e afugentamento",
  "Geoprocessamento",
  "Educacao ambiental",
  "Botanica e flora",
];

const availableProfiles = ["Mastozoologia", "Herpetologia", "Ornitologia", "Botanica"];

const heroStats = [
  ["4", "perfis tecnicos"],
  ["6", "areas de atuacao"],
  ["3", "modalidades de vaga"],
];

const workflowSteps: Array<{
  body: string;
  icon: LucideIcon;
  title: string;
}> = [
  {
    body: "Especialidades, CRBio, documentos e experiencia por grupo.",
    icon: BadgeCheck,
    title: "Perfil tecnico",
  },
  {
    body: "Viagens, campanhas longas, diaria, PJ, CLT e consultoria.",
    icon: CalendarDays,
    title: "Disponibilidade",
  },
  {
    body: "Arquitetura preparada para validacao manual e futura automacao.",
    icon: ShieldCheck,
    title: "Verificacao",
  },
  {
    body: "Score claro entre requisito da vaga e dados do profissional.",
    icon: UsersRound,
    title: "Matching",
  },
];

export default function HomePage() {
  return (
    <main className="bg-[#f5fbf8]">
      <section className="premium-shell min-h-screen text-white">
        <div className="absolute inset-y-0 right-0 hidden w-[58%] bg-[url('/images/bio-hero-premium.png')] bg-cover bg-center opacity-90 lg:block" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,7,9,0.99)_0%,rgba(2,7,9,0.93)_38%,rgba(2,7,9,0.54)_66%,rgba(2,7,9,0.14)_100%)]" />

        <header className="relative z-10 mx-auto flex w-full max-w-7xl px-6 pt-5">
          <div className="premium-nav flex w-full items-center justify-between rounded-[8px] px-4 py-3">
            <a className="flex items-center gap-3" href="#top" aria-label="BioConecta">
              <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950/30 ring-1 ring-white/30">
                <Microscope size={20} strokeWidth={2.4} />
              </span>
              <span className="text-lg font-bold tracking-[0.08em]">BIOCONECTA</span>
            </a>

            <nav className="hidden items-center gap-7 text-sm text-white/78 md:flex">
              <a className="hover:text-white" href="#vagas-recentes">
                Vagas
              </a>
              <a className="hover:text-white" href="#como-funciona">
                Como funciona
              </a>
              <a className="hover:text-white" href="#empresas">
                Para empresas
              </a>
            </nav>

            <HomeAuthActions context="header" />
          </div>
        </header>

        <div
          id="top"
          className="relative z-10 mx-auto grid min-h-[calc(100vh-84px)] max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[1fr_430px]"
        >
          <div className="max-w-4xl">
            <div className="premium-kicker mb-6">
              <Sparkles size={15} />
              Infraestrutura profissional para biologia
            </div>

            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.01] tracking-tight md:text-7xl">
              O hub premium para contratar talentos da Biologia.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 md:text-xl">
              Perfis tecnicos, documentos, CRBio, disponibilidade de campo, matching e contato
              direto em um fluxo unico para empresas e biologos.
            </p>

            <HomeAuthActions context="hero" />

            <form
              id="busca"
              action="/vagas"
              className="mt-10 grid max-w-4xl gap-3 rounded-[8px] border border-white/16 bg-white/[0.92] p-3 text-slate-950 shadow-2xl shadow-slate-950/35 backdrop-blur md:grid-cols-[1fr_1fr_auto]"
            >
              <label className="sr-only" htmlFor="search-role">
                Cargo ou especialidade
              </label>
              <div className="flex items-center gap-2 rounded-[6px] bg-slate-50 px-4 py-3 text-slate-950 ring-1 ring-slate-200">
                <Search size={18} className="text-slate-500" />
                <input
                  id="search-role"
                  name="q"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                  placeholder="Cargo ou especialidade"
                />
              </div>
              <label className="sr-only" htmlFor="search-location">
                Cidade ou estado
              </label>
              <div className="flex items-center gap-2 rounded-[6px] bg-slate-50 px-4 py-3 text-slate-950 ring-1 ring-slate-200">
                <MapPin size={18} className="text-slate-500" />
                <input
                  id="search-location"
                  name="local"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                  placeholder="Cidade ou estado"
                />
              </div>
              <Button type="submit">Buscar oportunidades</Button>
            </form>

            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
              {heroStats.map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-[8px] border border-white/12 bg-white/[0.09] p-4 shadow-lg shadow-black/10 backdrop-blur"
                >
                  <p className="text-2xl font-semibold text-cyan-200">{value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-300">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="premium-card p-4">
            <div className="rounded-[8px] bg-white/[0.96] p-5 text-slate-950 shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                    Painel ativo
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">Oportunidades em destaque</h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Online
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {recentJobs.map((job) => (
                  <div
                    key={job.title}
                    className="rounded-[8px] border border-slate-200 bg-gradient-to-br from-white to-cyan-50/35 p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-700">
                      <BriefcaseBusiness size={14} />
                      {job.mode}
                    </div>
                    <p className="mt-2 font-semibold">{job.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{job.location}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[8px] bg-[linear-gradient(135deg,#020617,#063b40)] p-4 text-white shadow-xl shadow-slate-950/25">
                {["Perfil tecnico", "Documentos", "Contato com candidatos"].map((item) => (
                  <p key={item} className="flex items-center gap-2 py-1.5 text-sm text-slate-200">
                    <CheckCircle2 size={16} className="text-cyan-300" />
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-emerald-100 bg-[#e9f8f3] py-12">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 md:grid-cols-4">
          {[
            ["Perfis verificaveis", "CRBio, documentos e experiencia tecnica."],
            ["Matching transparente", "Compatibilidade explicada por criterio."],
            ["Campo e escritorio", "CLT, PJ, diaria, campanha e consultoria."],
            ["Banco disponivel", "Profissionais prontos para novos projetos."],
          ].map(([title, body]) => (
            <div
              key={title}
              className="soft-card rounded-[8px] p-5 transition hover:-translate-y-1 hover:border-cyan-200"
            >
              <p className="font-semibold text-slate-950">{title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Perfil validado
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            A vitrine do biologo precisa mostrar tecnica, campo e confianca.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            O BioConecta organiza areas de atuacao, grupos taxonomicos, documentos, certificados e
            experiencia real para transformar curriculo solto em perfil profissional avaliavel.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              ["CRBio e documentos", "Upload, historico e validacao."],
              ["Experiencia de campo", "Campanhas, metodos e entregas."],
              ["Matching tecnico", "Compatibilidade por requisito."],
              ["Contato direto", "Email, telefone e WhatsApp."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-[8px] border border-cyan-100 bg-white/80 p-4">
                <p className="font-semibold text-slate-950">{title}</p>
                <p className="mt-1 text-sm text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-card overflow-hidden rounded-[8px] p-0">
          <div className="relative aspect-[16/10]">
            <Image
              src="/images/profile-field-premium.png"
              alt="Equipamentos de campo e painel digital de perfil profissional de biologia."
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 52vw, 100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_44%,rgba(2,6,23,0.78)_100%)]" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                Perfil tecnico
              </p>
              <p className="mt-2 max-w-xl text-lg font-semibold">
                Documentos, experiencia e especialidades em um fluxo preparado para contratacao.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="vagas-recentes" className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
              Vagas recentes
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Oportunidades desenhadas para a rotina real da Biologia.
            </h2>
          </div>
          <Button asChild variant="secondary">
            <Link href="/vagas">Ver vagas publicadas</Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {recentJobs.map((job) => (
            <article
              key={job.title}
              className="soft-card rounded-[8px] p-6 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-lg"
            >
              <div className="flex items-center gap-2 text-sm text-cyan-700">
                <BriefcaseBusiness size={16} />
                {job.mode}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-950">{job.title}</h3>
              <p className="mt-3 text-sm text-slate-600">{job.company}</p>
              <p className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                <MapPin size={16} />
                {job.location}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="como-funciona"
        className="bg-[linear-gradient(135deg,#020617,#05272d)] py-20 text-white"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-300">
              Como funciona
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Menos rede social, mais infraestrutura profissional.
            </h2>
            <p className="mt-5 text-slate-300">
              O BioConecta nasce para entender CRBio, campanhas, tecnicas de amostragem,
              disponibilidade e modalidades de contratacao.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {workflowSteps.map(({ body, icon: Icon, title }) => (
              <div
                key={title}
                className="rounded-[8px] border border-white/10 bg-white/[0.075] p-5 shadow-xl shadow-black/10 backdrop-blur transition hover:-translate-y-1 hover:border-cyan-300/40"
              >
                <Icon className="text-cyan-300" size={22} />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="empresas" className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Para empresas
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            Encontre biologos disponiveis por area, tecnica e localidade.
          </h2>
          <p className="mt-5 text-slate-600">
            A busca profissional sera preparada para filtros como CNH, CNPJ, nota fiscal, grupos
            taxonomicos, diaria pretendida e disponibilidade imediata.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {availableProfiles.map((item) => (
              <span
                key={item}
                className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-800"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="soft-card overflow-hidden rounded-[8px] p-0">
          <div className="relative aspect-[16/9]">
            <Image
              src="/images/company-hiring-premium.png"
              alt="Equipe ambiental analisando candidatos, mapas e dados tecnicos em um painel digital."
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-slate-950 text-cyan-300">
                <Building2 size={22} />
              </span>
              <div>
                <p className="font-semibold text-slate-950">Biologos disponiveis</p>
                <p className="text-sm text-slate-500">Filtro inicial planejado para empresas</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {practiceAreas.map((area) => (
                <div
                  key={area}
                  className="flex items-center justify-between rounded-[8px] bg-slate-50 px-4 py-3"
                >
                  <span className="text-sm font-medium text-slate-700">{area}</span>
                  <Sprout size={17} className="text-cyan-700" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cyan-50 py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-cyan-800">
              <GraduationCap size={17} />
              BioConecta
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Conecte talento tecnico a oportunidades ambientais reais.
            </h2>
            <p className="mt-2 text-slate-600">
              Crie seu perfil, publique vagas ou encontre profissionais preparados para campo,
              licenciamento, monitoramento e consultoria ambiental.
            </p>
          </div>
          <HomeAuthActions context="footer" />
        </div>
      </section>
    </main>
  );
}
