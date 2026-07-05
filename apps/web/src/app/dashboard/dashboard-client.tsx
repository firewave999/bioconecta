"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { apiFetch, getStoredAccessToken } from "@/lib/api";

type DashboardState = {
  certificationsCount: number;
  completion: number;
  documentsCount: number;
  email: string;
  experiencesCount: number;
  firstName: string;
  profileExists: boolean;
  professionalStarted: boolean;
  title: string;
};

export function DashboardClient() {
  const [state, setState] = useState<DashboardState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredAccessToken();

    if (!token) {
      setError("Voce precisa entrar para acessar o dashboard.");
      return;
    }

    Promise.all([
      apiFetch<{ user: { email: string; firstName: string } }>("/auth/me", { token }),
      apiFetch<{
        completion: number;
        professional: {
          certifications: unknown[];
          documents: unknown[];
          experiences: unknown[];
          practiceAreas: unknown[];
          skills: unknown[];
          taxonomicGroups: unknown[];
        };
        profile: { headline?: string | null } | null;
      }>("/biologist-profile/me", { token }),
    ])
      .then(([me, profile]) => {
        const professionalCount =
          profile.professional.practiceAreas.length +
          profile.professional.taxonomicGroups.length +
          profile.professional.skills.length +
          profile.professional.experiences.length +
          profile.professional.certifications.length +
          profile.professional.documents.length;

        setState({
          certificationsCount: profile.professional.certifications.length,
          completion: profile.completion,
          documentsCount: profile.professional.documents.length,
          email: me.user.email,
          experiencesCount: profile.professional.experiences.length,
          firstName: me.user.firstName,
          profileExists: Boolean(profile.profile),
          professionalStarted: professionalCount > 0,
          title: profile.profile?.headline || "Perfil profissional em construcao",
        });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Nao foi possivel carregar o dashboard.");
      });
  }, []);

  if (error) {
    return (
      <div className="rounded-[8px] border border-red-200 bg-red-50 p-5 text-red-700">
        <p>{error}</p>
        <Button asChild className="mt-4">
          <Link href="/login">Ir para login</Link>
        </Button>
      </div>
    );
  }

  if (!state) {
    return <p className="text-slate-600">Carregando dashboard...</p>;
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Ola, {state.firstName}</h1>
            <p className="mt-2 text-slate-600">{state.email}</p>
          </div>
          <LogoutButton />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[8px] border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Conclusao do perfil</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{state.completion}%</p>
        </div>
        <div className="rounded-[8px] border border-slate-200 bg-white p-5 md:col-span-2">
          <p className="text-sm text-slate-500">Headline</p>
          <p className="mt-2 text-xl font-semibold text-slate-950">{state.title}</p>
        </div>
      </section>

      {state.profileExists ? (
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[8px] border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Experiencias</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{state.experiencesCount}</p>
          </div>
          <div className="rounded-[8px] border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Certificacoes</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {state.certificationsCount}
            </p>
          </div>
          <div className="rounded-[8px] border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Documentos</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{state.documentsCount}</p>
          </div>
        </section>
      ) : null}

      <section className="rounded-[8px] border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-950">
          {state.profileExists
            ? state.professionalStarted
              ? "Seu perfil profissional esta avancando."
              : "Complete seu perfil profissional."
            : "Complete seu onboarding."}
        </h2>
        <p className="mt-2 text-slate-600">
          Adicione documentos, areas de atuacao, grupos taxonomicos, competencias, experiencias e
          certificacoes.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href={state.profileExists ? "/perfil/editar" : "/onboarding/biologo"}>
              {state.profileExists ? "Editar perfil" : "Completar onboarding"}
            </Link>
          </Button>
          {state.profileExists ? (
            <Button asChild variant="secondary">
              <Link href="/perfil/profissional">Perfil profissional</Link>
            </Button>
          ) : null}
          <Button asChild variant="secondary">
            <Link href="/">Ver Home</Link>
          </Button>
        </div>
      </section>

      <section className="rounded-[8px] border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-950">Area da empresa</h2>
        <p className="mt-2 text-slate-600">
          Cadastre a empresa, publique vagas e defina requisitos profissionais para biologos.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/empresa">Cadastrar ou editar empresa</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/empresa/vagas">Minhas vagas</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/vagas">Vagas publicadas</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/candidaturas">Minhas candidaturas</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/favoritos">Favoritos</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
