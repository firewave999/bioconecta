"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getStoredAccessToken } from "@/lib/api";

type HomeAuthActionsProps = {
  context: "header" | "hero" | "footer";
};

export function HomeAuthActions({ context }: HomeAuthActionsProps) {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    setHasSession(Boolean(getStoredAccessToken()));
  }, []);

  if (context === "header") {
    return (
      <Button asChild size="sm" variant="outline">
        <Link href={hasSession ? "/dashboard" : "/login"}>
          {hasSession ? "Dashboard" : "Entrar"}
        </Link>
      </Button>
    );
  }

  if (context === "footer") {
    return (
      <Button asChild variant="secondary">
        <Link href={hasSession ? "/dashboard" : "/empresa"}>
          {hasSession ? "Ir para dashboard" : "Cadastrar empresa"}
        </Link>
      </Button>
    );
  }

  if (hasSession) {
    return (
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/dashboard">Ir para dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/vagas">Ver vagas</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <Button asChild>
        <Link href="/cadastro">Sou biologo</Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/empresa">Cadastrar empresa</Link>
      </Button>
    </div>
  );
}
