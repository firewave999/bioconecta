import Image from "next/image";
import Link from "next/link";

type AuthVisualPanelProps = {
  body: string;
  eyebrow: string;
  image: "company" | "field" | "hero";
  title: string;
};

const imageMap = {
  company: {
    alt: "Equipe ambiental analisando mapas, candidatos e dados tecnicos.",
    src: "/images/company-hiring-premium.png",
  },
  field: {
    alt: "Equipamentos de campo e painel digital de perfil profissional.",
    src: "/images/profile-field-premium.png",
  },
  hero: {
    alt: "Biologa em campo usando tablet com dados ambientais.",
    src: "/images/bio-hero-premium.png",
  },
};

export function AuthVisualPanel({ body, eyebrow, image, title }: AuthVisualPanelProps) {
  const visual = imageMap[image];

  return (
    <section className="relative overflow-hidden rounded-[8px] border border-white/12 bg-slate-950 text-white shadow-2xl shadow-slate-950/35">
      <Image
        alt={visual.alt}
        className="object-cover opacity-68"
        fill
        priority
        sizes="(min-width: 1024px) 42vw, 100vw"
        src={visual.src}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.36)_0%,rgba(2,6,23,0.92)_100%)]" />
      <div className="relative z-10 flex min-h-[560px] flex-col justify-between p-7 md:p-9">
        <Link
          className="w-fit text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100 hover:text-white"
          href="/"
        >
          Voltar para home
        </Link>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-200">{body}</p>
        </div>

        <div className="grid gap-3 rounded-[8px] border border-white/12 bg-white/10 p-4 backdrop-blur">
          {["Perfil verificavel", "Vagas e candidaturas", "Contato profissional"].map((item) => (
            <p key={item} className="text-sm font-medium text-slate-100">
              {item}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
