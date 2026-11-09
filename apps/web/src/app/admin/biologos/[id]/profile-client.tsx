"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiFetch, getStoredAccessToken } from "@/lib/api";

type AdminUser = {
  email: string;
  emailVerifiedAt?: string | null;
  firstName: string;
  id: string;
  lastName: string;
  phone: string | null;
  roles: string[];
};

type Profile = {
  acceptsTravel: boolean;
  availabilityStatus: string;
  availableFrom: string | null;
  avatarUrl: string | null;
  bio: string | null;
  birthDate: string;
  city: string;
  cpf: string;
  crbioNumber: string;
  crbioRegion: string;
  fullName: string;
  graduationYear: number;
  hasCnpj: boolean;
  hasDriverLicense: boolean;
  hasOwnVehicle: boolean;
  headline: string | null;
  issuesInvoice: boolean;
  registrationStatus: string;
  state: string;
  user: AdminUser;
  verificationStatus: string;
};

type NamedItem = {
  name: string;
};

type Experience = {
  description: string | null;
  endYear: number | null;
  isCurrent: boolean;
  organizationName: string | null;
  startYear: number;
  title: string;
};

type Certification = {
  credentialUrl: string | null;
  issuedYear: number | null;
  issuerName: string | null;
  name: string;
};

type DocumentItem = {
  fileUrl: string;
  title: string;
  type: string;
  verificationStatus: string;
};

type Response = {
  completion: number;
  professional: {
    certifications: Certification[];
    documents: DocumentItem[];
    experiences: Experience[];
    practiceAreas: NamedItem[];
    skills: NamedItem[];
    taxonomicGroups: NamedItem[];
  };
  profile: Profile;
};

export function AdminBiologistProfileClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<Response | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredAccessToken();

    if (!token) {
      router.push("/login");
      return;
    }

    apiFetch<Response>(`/admin/biologists/${params.id}`, { token })
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Não foi possível carregar o perfil."),
      );
  }, [params.id, router]);

  if (error) {
    return (
      <section className="rounded-[8px] border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </section>
    );
  }

  if (!data) {
    return (
      <div className="grid gap-6">
        <div className="page-header h-72 animate-pulse rounded-[8px]" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="soft-card h-32 animate-pulse rounded-[8px]" />
          <div className="soft-card h-32 animate-pulse rounded-[8px]" />
          <div className="soft-card h-32 animate-pulse rounded-[8px]" />
        </div>
      </div>
    );
  }

  const { professional, profile } = data;

  return (
    <div className="grid gap-6">
      <section className="page-header overflow-hidden rounded-[8px]">
        <div className="grid gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:p-8">
          {profile.avatarUrl ? (
            <img
              alt={`Foto de ${profile.fullName}`}
              className="h-28 w-28 rounded-full border border-cyan-100 bg-white object-cover shadow-lg"
              src={profile.avatarUrl}
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-cyan-50 text-3xl font-semibold text-cyan-800">
              {profile.fullName.slice(0, 1)}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
              Perfil publico do biólogo
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
              {profile.fullName}
            </h1>
            <p className="mt-2 max-w-3xl text-slate-600">
              {profile.headline ?? "Headline profissional não informada."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{getVerificationStatusLabel(profile.verificationStatus)}</Badge>
              <Badge>
                CRBio {profile.crbioNumber}/{profile.crbioRegion}
              </Badge>
              <Badge>
                {profile.city}/{profile.state}
              </Badge>
            </div>
          </div>
          <div className="rounded-[8px] border border-cyan-100 bg-white/78 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cyan-700">
              Conclusao
            </p>
            <p className="mt-2 text-4xl font-semibold text-slate-950">{data.completion}%</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric icon={<Mail size={19} />} label="E-mail" value={profile.user.email} />
        <Metric icon={<Phone size={19} />} label="Telefone" value={profile.user.phone ?? "-"} />
        <Metric
          icon={<MapPin size={19} />}
          label="Local"
          value={`${profile.city}/${profile.state}`}
        />
        <Metric
          icon={<CalendarDays size={19} />}
          label="Disponibilidade"
          value={getAvailabilityLabel(profile.availabilityStatus, profile.availableFrom)}
        />
      </section>

      <section className="soft-card rounded-[8px] p-6">
        <h2 className="text-xl font-semibold text-slate-950">Resumo profissional</h2>
        <p className="mt-3 whitespace-pre-line text-slate-700">
          {profile.bio ?? "Biografia não informada."}
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Flag active={profile.acceptsTravel} label="Aceita viagens" />
          <Flag active={profile.hasDriverLicense} label="Possui CNH" />
          <Flag active={profile.hasOwnVehicle} label="Possui veiculo" />
          <Flag active={profile.hasCnpj} label="Possui CNPJ" />
          <Flag active={profile.issuesInvoice} label="Emite nota fiscal" />
          <Flag active={Boolean(profile.user.emailVerifiedAt)} label="E-mail verificado" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <TagCard
          title="Áreas de atuação"
          values={professional.practiceAreas.map((item) => item.name)}
        />
        <TagCard
          title="Grupos taxonomicos"
          values={professional.taxonomicGroups.map((item) => item.name)}
        />
        <TagCard title="Competencias" values={professional.skills.map((item) => item.name)} />
      </section>

      <section className="soft-card rounded-[8px] p-6">
        <SectionHeader icon={<BriefcaseBusiness size={20} />} title="Experiências" />
        <div className="mt-4 grid gap-3">
          {professional.experiences.length ? (
            professional.experiences.map((experience, index) => (
              <article className="rounded-[8px] border border-cyan-100 bg-white p-4" key={index}>
                <p className="font-semibold text-slate-950">{experience.title}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {experience.organizationName ?? "Organizacao não informada"} -{" "}
                  {experience.startYear}-
                  {experience.isCurrent ? "atual" : (experience.endYear ?? "não informado")}
                </p>
                {experience.description ? (
                  <p className="mt-3 whitespace-pre-line text-sm text-slate-700">
                    {experience.description}
                  </p>
                ) : null}
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-500">Nenhuma experiência cadastrada.</p>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="soft-card rounded-[8px] p-6">
          <SectionHeader icon={<BadgeCheck size={20} />} title="Certificações" />
          <div className="mt-4 grid gap-3">
            {professional.certifications.length ? (
              professional.certifications.map((certification) => (
                <article
                  className="rounded-[8px] border border-cyan-100 bg-white p-4"
                  key={certification.name}
                >
                  <p className="font-semibold text-slate-950">{certification.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {certification.issuerName ?? "Emissor não informado"}
                    {certification.issuedYear ? ` - ${certification.issuedYear}` : ""}
                  </p>
                  {certification.credentialUrl ? (
                    <Button asChild className="mt-3" size="sm" variant="light">
                      <a href={certification.credentialUrl} rel="noreferrer" target="_blank">
                        Ver credencial
                      </a>
                    </Button>
                  ) : null}
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">Nenhuma certificação cadastrada.</p>
            )}
          </div>
        </div>

        <div className="soft-card rounded-[8px] p-6">
          <SectionHeader icon={<FileText size={20} />} title="Documentos" />
          <div className="mt-4 grid gap-3">
            {professional.documents.length ? (
              professional.documents.map((document) => (
                <a
                  className="rounded-[8px] border border-cyan-100 bg-white p-4 text-sm font-semibold text-cyan-800"
                  href={document.fileUrl}
                  key={`${document.type}-${document.title}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  {document.title} ({document.type}) -{" "}
                  {getVerificationStatusLabel(document.verificationStatus)}
                </a>
              ))
            ) : (
              <p className="text-sm text-slate-500">Nenhum documento cadastrado.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="soft-card rounded-[8px] p-5">
      <div className="text-cyan-700">{icon}</div>
      <p className="mt-3 text-sm text-slate-500">{label}</p>
      <p className="mt-1 break-words font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
      {children}
    </span>
  );
}

function Flag({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
      {active ? "OK" : "-"} - {label}
    </div>
  );
}

function TagCard({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="soft-card rounded-[8px] p-5">
      <h2 className="font-semibold text-slate-950">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {values.length ? (
          values.map((value) => <Badge key={value}>{value}</Badge>)
        ) : (
          <Badge>Não informado</Badge>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-950">
      <span className="text-cyan-700">{icon}</span>
      {title}
    </h2>
  );
}

function getVerificationStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Pendente",
    REJECTED: "Rejeitado",
    SUSPENDED: "Suspenso",
    UNVERIFIED: "Não verificado",
    VERIFIED: "Verificado",
  };

  return labels[status] ?? status;
}

function getAvailabilityLabel(status: string, availableFrom: string | null) {
  const labels: Record<string, string> = {
    AVAILABLE_FROM_DATE: availableFrom ? `A partir de ${availableFrom}` : "A partir de data",
    AVAILABLE_NOW: "Disponível agora",
    UNAVAILABLE: "Indisponivel",
  };

  return labels[status] ?? status;
}
