"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { apiFetch, getStoredAccessToken } from "@/lib/api";

type Candidate = {
  biologistProfile: {
    avatarUrl: string | null;
    city: string;
    fullName: string;
    headline: string | null;
    state: string;
    user: {
      email: string;
      firstName: string;
      id: string;
      lastName: string;
      phone: string | null;
    };
    verificationStatus: string;
  };
  coverMessage: string | null;
  id: string;
  matchReasons: string[];
  matchScore: number;
  professional: {
    certifications: Array<{
      credentialUrl: string | null;
      issuedYear: number | null;
      issuerName: string | null;
      name: string;
    }>;
    documents: Array<{
      fileUrl: string;
      title: string;
      type: string;
      verificationStatus: string;
    }>;
    experiences: Array<{
      description: string | null;
      endYear: number | null;
      isCurrent: boolean;
      organizationName: string | null;
      startYear: number;
      title: string;
    }>;
    practiceAreas: string[];
    skills: string[];
    taxonomicGroups: string[];
  };
  status: string;
};

type Response = {
  applications: Candidate[];
  job: {
    title: string;
  };
};

const statuses: Array<[string, string]> = [
  ["APPLIED", "Inscrito"],
  ["UNDER_REVIEW", "Em analise"],
  ["SHORTLISTED", "Selecionado"],
  ["INTERVIEW", "Entrevista"],
  ["OFFER", "Oferta"],
  ["HIRED", "Contratado"],
  ["REJECTED", "Rejeitado"],
];

export function CandidatesClient() {
  const params = useParams<{ id: string }>();
  const [applications, setApplications] = useState<Candidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState("Carregando vaga...");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getStoredAccessToken();

    if (!token) {
      setError("Voce precisa entrar para ver candidatos.");
      return;
    }

    try {
      const response = await apiFetch<Response>(`/applications/jobs/${params.id}/candidates`, {
        token,
      });
      setApplications(response.applications);
      setJobTitle(response.job.title);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel carregar candidatos.");
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateStatus(applicationId: string, status: string) {
    const token = getStoredAccessToken();

    if (!token) {
      setError("Voce precisa entrar para atualizar candidatos.");
      return;
    }

    setLoadingId(applicationId);

    try {
      await apiFetch<{ application: Candidate }, Record<string, unknown>>(
        `/applications/${applicationId}/status`,
        {
          body: { status },
          method: "PUT",
          token,
        },
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel atualizar status.");
    } finally {
      setLoadingId(null);
    }
  }

  if (error) {
    return (
      <div className="rounded-[8px] border border-red-200 bg-red-50 p-5 text-red-700">
        <p>{error}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/empresa/vagas">Voltar para vagas</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard">Voltar ao dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Candidatos
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">{jobTitle}</h1>
      </section>

      <section className="grid gap-4">
        {applications.length ? (
          applications.map((application) => (
            <article
              className="rounded-[8px] border border-slate-200 bg-white p-5"
              key={application.id}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-col gap-3 md:flex-row md:items-start">
                  {application.biologistProfile.avatarUrl ? (
                    <img
                      alt={`Foto de ${application.biologistProfile.fullName}`}
                      className="h-16 w-16 rounded-full border border-slate-200 bg-white object-cover"
                      src={application.biologistProfile.avatarUrl}
                    />
                  ) : null}
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">
                      {application.biologistProfile.fullName}
                    </h2>
                    <p className="mt-1 text-slate-600">
                      {application.biologistProfile.headline ?? "Sem headline"} |{" "}
                      {application.biologistProfile.city}/{application.biologistProfile.state}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-cyan-800">
                      Match: {application.matchScore}%
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Verificacao: {application.biologistProfile.verificationStatus}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  {application.status}
                </span>
              </div>

              <div className="mt-4 grid gap-3 rounded-[8px] border border-cyan-100 bg-cyan-50 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-sm font-semibold text-cyan-950">Contato do candidato</p>
                  <p className="mt-1 text-sm text-slate-700">
                    Email:{" "}
                    <a
                      className="font-medium text-cyan-800 underline-offset-2 hover:underline"
                      href={`mailto:${application.biologistProfile.user.email}`}
                    >
                      {application.biologistProfile.user.email}
                    </a>
                  </p>
                  {application.biologistProfile.user.phone ? (
                    <p className="mt-1 text-sm text-slate-700">
                      Telefone:{" "}
                      <a
                        className="font-medium text-cyan-800 underline-offset-2 hover:underline"
                        href={`tel:${application.biologistProfile.user.phone}`}
                      >
                        {application.biologistProfile.user.phone}
                      </a>
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-slate-500">
                      Telefone nao informado no cadastro.
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" type="button">
                    <a href={`mailto:${application.biologistProfile.user.email}`}>Enviar email</a>
                  </Button>
                  {application.biologistProfile.user.phone ? (
                    <Button asChild size="sm" type="button" variant="secondary">
                      <a href={`tel:${application.biologistProfile.user.phone}`}>Ligar</a>
                    </Button>
                  ) : null}
                </div>
              </div>

              {application.coverMessage ? (
                <div className="mt-4 rounded-[8px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">Mensagem do candidato</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-slate-600">
                    {application.coverMessage}
                  </p>
                </div>
              ) : null}

              {application.matchReasons.length ? (
                <ul className="mt-4 list-inside list-disc text-sm text-slate-600">
                  {application.matchReasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <TagList items={application.professional.practiceAreas} title="Areas" />
                  <TagList
                    items={application.professional.taxonomicGroups}
                    title="Grupos taxonomicos"
                  />
                  <TagList items={application.professional.skills} title="Competencias" />
                </div>

                {application.professional.experiences.length ? (
                  <ProfileBlock title="Experiencias">
                    {application.professional.experiences.slice(0, 3).map((experience, index) => (
                      <div className="rounded-[8px] border border-slate-200 p-3" key={index}>
                        <p className="font-semibold text-slate-950">{experience.title}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {experience.organizationName ?? "Organizacao nao informada"} -{" "}
                          {experience.startYear}-
                          {experience.isCurrent ? "atual" : (experience.endYear ?? "nao informado")}
                        </p>
                        {experience.description ? (
                          <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
                            {experience.description}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </ProfileBlock>
                ) : null}

                {application.professional.certifications.length ? (
                  <ProfileBlock title="Certificacoes">
                    {application.professional.certifications.slice(0, 4).map((certification) => (
                      <div
                        className="rounded-[8px] border border-slate-200 p-3"
                        key={certification.name}
                      >
                        <p className="font-semibold text-slate-950">{certification.name}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {certification.issuerName ?? "Emissor nao informado"}
                          {certification.issuedYear ? ` - ${certification.issuedYear}` : ""}
                        </p>
                        {certification.credentialUrl ? (
                          <a
                            className="mt-2 inline-flex text-sm font-semibold text-cyan-800"
                            href={certification.credentialUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Ver credencial
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </ProfileBlock>
                ) : null}

                {application.professional.documents.length ? (
                  <ProfileBlock title="Documentos">
                    {application.professional.documents.slice(0, 4).map((document) => (
                      <a
                        className="rounded-[8px] border border-slate-200 p-3 text-sm font-semibold text-cyan-800"
                        href={document.fileUrl}
                        key={`${document.type}-${document.title}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {document.title} ({document.type}) - {document.verificationStatus}
                      </a>
                    ))}
                  </ProfileBlock>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {statuses.map(([value, label]) => (
                  <Button
                    disabled={loadingId === application.id || application.status === value}
                    key={value}
                    onClick={() => updateStatus(application.id, value)}
                    size="sm"
                    type="button"
                    variant={application.status === value ? "primary" : "secondary"}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </article>
          ))
        ) : (
          <EmptyState
            actionHref="/empresa/vagas"
            actionLabel="Voltar para vagas"
            description="Quando biologos se candidatarem, eles aparecerao aqui com match, status e proximas acoes."
            title="Nenhum candidato ainda"
          />
        )}
      </section>
    </div>
  );
}

function TagList({ items, title }: { items: string[]; title: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.length ? (
          items.slice(0, 8).map((item) => (
            <span
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
              key={item}
            >
              {item}
            </span>
          ))
        ) : (
          <span className="text-sm text-slate-500">Nao informado.</span>
        )}
      </div>
    </div>
  );
}

function ProfileBlock({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <div className="mt-2 grid gap-2 md:grid-cols-2">{children}</div>
    </div>
  );
}
