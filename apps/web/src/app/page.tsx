import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
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
    <main>
      <section className="hero-background min-h-screen text-white">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
          <a className="flex items-center gap-3" href="#top" aria-label="BioConecta">
            <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-cyan-300 text-slate-950">
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

          <Button asChild size="sm" variant="outline">
            <a href="#busca">Buscar</a>
          </Button>
        </header>

        <div
          id="top"
          className="mx-auto grid min-h-[calc(100vh-84px)] max-w-7xl items-center px-6 py-12"
        >
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-cyan-100 backdrop-blur">
              <Sparkles size={15} />
              Plataforma profissional para a Biologia no Brasil
            </div>

            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
              A oportunidade certa para quem vive a Biologia.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-100 md:text-xl">
              Encontre vagas, projetos, campanhas de campo e profissionais especializados em todo o
              Brasil.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <a href="#vagas-recentes">
                  Sou biologo
                  <ArrowRight size={18} />
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="#empresas">Sou empresa</a>
              </Button>
            </div>

            <form
              id="busca"
              action="#vagas-recentes"
              className="mt-10 grid max-w-3xl gap-3 rounded-[8px] border border-white/20 bg-white/12 p-3 backdrop-blur-md md:grid-cols-[1fr_1fr_auto]"
            >
              <label className="sr-only" htmlFor="search-role">
                Cargo ou especialidade
              </label>
              <div className="flex items-center gap-2 rounded-[6px] bg-white px-4 py-3 text-slate-950">
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
              <div className="flex items-center gap-2 rounded-[6px] bg-white px-4 py-3 text-slate-950">
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
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-12">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 md:grid-cols-4">
          {[
            ["Perfis verificaveis", "CRBio, documentos e experiencia tecnica."],
            ["Matching transparente", "Compatibilidade explicada por criterio."],
            ["Campo e escritorio", "CLT, PJ, diaria, campanha e consultoria."],
            ["Banco disponivel", "Profissionais prontos para novos projetos."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-[8px] border border-slate-200 bg-slate-50 p-5">
              <p className="font-semibold text-slate-950">{title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </div>
          ))}
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
            <a href="#busca">Refinar busca</a>
          </Button>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {recentJobs.map((job) => (
            <article
              key={job.title}
              className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm"
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

      <section id="como-funciona" className="bg-slate-950 py-20 text-white">
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
              <div key={title} className="rounded-[8px] border border-white/10 bg-white/5 p-5">
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

        <div className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm">
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
      </section>

      <section className="bg-cyan-50 py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-cyan-800">
              <GraduationCap size={17} />
              Proxima fase
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Agora a base visual esta pronta.
            </h2>
            <p className="mt-2 text-slate-600">
              O proximo passo e evoluir para fluxos reais de autenticacao, onboarding e dashboard.
            </p>
          </div>
          <Button asChild variant="secondary">
            <a href="#top">Voltar ao topo</a>
          </Button>
        </div>
      </section>
    </main>
  );
}
