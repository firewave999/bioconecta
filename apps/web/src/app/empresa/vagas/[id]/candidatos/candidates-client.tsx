"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { apiFetch, getStoredAccessToken } from "@/lib/api";

type Candidate = {
  biologistProfile: {
    city: string;
    fullName: string;
    headline: string | null;
    state: string;
    verificationStatus: string;
  };
  id: string;
  matchReasons: string[];
  matchScore: number;
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
      <div className="rounded-[8px] border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>
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
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  {application.status}
                </span>
              </div>

              {application.matchReasons.length ? (
                <ul className="mt-4 list-inside list-disc text-sm text-slate-600">
                  {application.matchReasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              ) : null}

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
          <div className="rounded-[8px] border border-slate-200 bg-white p-6 text-slate-600">
            Nenhum candidato ainda.
          </div>
        )}
      </section>
    </div>
  );
}
