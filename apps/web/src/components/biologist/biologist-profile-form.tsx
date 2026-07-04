"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { apiFetch, getStoredAccessToken } from "@/lib/api";

type ProfileResponse = {
  completion: number;
  profile: BiologistProfile | null;
};

type BiologistProfile = {
  acceptsTravel: boolean;
  availabilityStatus: string;
  availableFrom: string | null;
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
};

type Props = {
  mode: "edit" | "onboarding";
};

export function BiologistProfileForm({ mode }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<BiologistProfile | null>(null);

  useEffect(() => {
    const token = getStoredAccessToken();

    if (!token) {
      router.push("/login");
      return;
    }

    apiFetch<ProfileResponse>("/biologist-profile/me", {
      token,
    })
      .then((response) => setProfile(response.profile))
      .catch(() => {
        if (mode === "edit") {
          setError("Nao foi possivel carregar seu perfil.");
        }
      });
  }, [mode, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const token = getStoredAccessToken();

    if (!token) {
      router.push("/login");
      return;
    }

    const form = new FormData(event.currentTarget);

    try {
      await apiFetch<ProfileResponse, Record<string, unknown>>("/biologist-profile/me", {
        body: {
          acceptsTravel: form.get("acceptsTravel") === "on",
          availabilityStatus: form.get("availabilityStatus"),
          availableFrom: form.get("availableFrom") || undefined,
          bio: form.get("bio"),
          birthDate: form.get("birthDate"),
          city: form.get("city"),
          cpf: form.get("cpf"),
          crbioNumber: form.get("crbioNumber"),
          crbioRegion: form.get("crbioRegion"),
          fullName: form.get("fullName"),
          graduationYear: Number(form.get("graduationYear")),
          hasCnpj: form.get("hasCnpj") === "on",
          hasDriverLicense: form.get("hasDriverLicense") === "on",
          hasOwnVehicle: form.get("hasOwnVehicle") === "on",
          headline: form.get("headline"),
          issuesInvoice: form.get("issuesInvoice") === "on",
          registrationStatus: form.get("registrationStatus"),
          state: form.get("state"),
        },
        method: "PUT",
        token,
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel salvar o perfil.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="grid gap-5 rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          {mode === "onboarding" ? "Onboarding" : "Editar perfil"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          {mode === "onboarding"
            ? "Complete seu perfil de biologo"
            : "Atualize seu perfil profissional"}
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field defaultValue={profile?.fullName} label="Nome completo" name="fullName" required />
        <Field defaultValue={profile?.cpf} label="CPF" name="cpf" required />
        <Field
          defaultValue={profile?.birthDate}
          label="Data de nascimento"
          name="birthDate"
          required
          type="date"
        />
        <Field
          defaultValue={profile?.graduationYear}
          label="Ano de formacao"
          name="graduationYear"
          required
          type="number"
        />
        <Field
          defaultValue={profile?.crbioNumber}
          label="Numero do CRBio"
          name="crbioNumber"
          required
        />
        <Field
          defaultValue={profile?.crbioRegion}
          label="Regiao do CRBio"
          name="crbioRegion"
          required
        />
        <Field defaultValue={profile?.state} label="Estado" maxLength={2} name="state" required />
        <Field defaultValue={profile?.city} label="Cidade" name="city" required />
      </div>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Situacao do registro
        <select
          className="h-11 rounded-[8px] border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-cyan-500"
          defaultValue={profile?.registrationStatus ?? "UNKNOWN"}
          name="registrationStatus"
        >
          <option value="ACTIVE">Ativo</option>
          <option value="PENDING">Pendente</option>
          <option value="INACTIVE">Inativo</option>
          <option value="UNKNOWN">Nao informado</option>
        </select>
      </label>

      <Field defaultValue={profile?.headline ?? ""} label="Headline profissional" name="headline" />

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Biografia
        <textarea
          className="min-h-28 rounded-[8px] border border-slate-300 px-3 py-3 text-slate-950 outline-none focus:border-cyan-500"
          defaultValue={profile?.bio ?? ""}
          name="bio"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Disponibilidade
          <select
            className="h-11 rounded-[8px] border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-cyan-500"
            defaultValue={profile?.availabilityStatus ?? "AVAILABLE_NOW"}
            name="availabilityStatus"
          >
            <option value="AVAILABLE_NOW">Disponivel agora</option>
            <option value="AVAILABLE_FROM_DATE">Disponivel a partir de uma data</option>
            <option value="UNAVAILABLE">Indisponivel</option>
          </select>
        </label>
        <Field
          defaultValue={profile?.availableFrom ?? ""}
          label="Disponivel a partir de"
          name="availableFrom"
          type="date"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Check
          defaultChecked={profile?.acceptsTravel}
          label="Aceita viagens"
          name="acceptsTravel"
        />
        <Check
          defaultChecked={profile?.hasDriverLicense}
          label="Possui CNH"
          name="hasDriverLicense"
        />
        <Check
          defaultChecked={profile?.hasOwnVehicle}
          label="Possui veiculo"
          name="hasOwnVehicle"
        />
        <Check defaultChecked={profile?.hasCnpj} label="Possui CNPJ" name="hasCnpj" />
        <Check
          defaultChecked={profile?.issuesInvoice}
          label="Emite nota fiscal"
          name="issuesInvoice"
        />
      </div>

      {error ? <p className="rounded-[8px] bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <Button disabled={loading} type="submit">
        {loading ? "Salvando..." : "Salvar perfil"}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  ...props
}: {
  defaultValue?: number | string;
  label: string;
  maxLength?: number;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <input
        className="h-11 rounded-[8px] border border-slate-300 px-3 text-slate-950 outline-none focus:border-cyan-500"
        name={name}
        type={type}
        {...props}
      />
    </label>
  );
}

function Check({
  defaultChecked,
  label,
  name,
}: {
  defaultChecked?: boolean;
  label: string;
  name: string;
}) {
  return (
    <label className="flex items-center gap-3 rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
      <input defaultChecked={defaultChecked} name={name} type="checkbox" />
      {label}
    </label>
  );
}
