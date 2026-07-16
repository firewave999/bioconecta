"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { apiFetch, getStoredAccessToken } from "@/lib/api";

type JobFormProps = {
  jobId?: string;
};

type Job = {
  acceptsStudents: boolean;
  city: string;
  contractType: string;
  description: string;
  requiredPracticeAreas: string[];
  requiredSkills: string[];
  requiredTaxonomicGroups: string[];
  requiresCrbio: boolean;
  requiresTravel: boolean;
  salaryMaxCents: number | null;
  salaryMinCents: number | null;
  state: string;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  title: string;
  workMode: string;
};

export function JobForm({ jobId }: JobFormProps) {
  const router = useRouter();
  const [canPublish, setCanPublish] = useState(false);
  const [companyStatus, setCompanyStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(jobId);

  useEffect(() => {
    const token = getStoredAccessToken();

    if (!token) {
      router.push("/login");
      return;
    }

    const companyRequest = jobId
      ? apiFetch<{ company: { verificationStatus: string }; job: Job }>(`/jobs/mine/${jobId}`, {
          token,
        })
      : apiFetch<{ company: { verificationStatus: string } | null }>("/companies/me", { token });

    companyRequest
      .then((response) => {
        const status = response.company?.verificationStatus ?? null;
        setCompanyStatus(status);
        setCanPublish(status === "VERIFIED");

        const loadedJob = (response as { job?: Job }).job;

        if (loadedJob) {
          setJob(loadedJob);
        }
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Nao foi possivel carregar a empresa."),
      )
      .finally(() => setInitialLoading(false));
  }, [jobId, router]);

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
    const status = canPublish
      ? String(form.get("status") ?? "DRAFT")
      : job?.status === "CLOSED"
        ? "CLOSED"
        : "DRAFT";
    const body = {
      acceptsStudents: form.get("acceptsStudents") === "on",
      city: form.get("city"),
      contractType: form.get("contractType"),
      description: form.get("description"),
      requiredPracticeAreas: splitList(String(form.get("requiredPracticeAreas") ?? "")),
      requiredSkills: splitList(String(form.get("requiredSkills") ?? "")),
      requiredTaxonomicGroups: splitList(String(form.get("requiredTaxonomicGroups") ?? "")),
      requiresCrbio: form.get("requiresCrbio") === "on",
      requiresTravel: form.get("requiresTravel") === "on",
      salaryMaxCents: moneyToCents(String(form.get("salaryMax") ?? "")),
      salaryMinCents: moneyToCents(String(form.get("salaryMin") ?? "")),
      state: form.get("state"),
      status,
      title: form.get("title"),
      workMode: form.get("workMode"),
    };

    try {
      await apiFetch<{ job: unknown }, Record<string, unknown>>(
        isEditing ? `/jobs/${jobId}` : "/jobs",
        {
          body,
          method: isEditing ? "PUT" : "POST",
          token,
        },
      );

      router.push("/empresa/vagas");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel criar a vaga.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCloseJob() {
    setError(null);
    setLoading(true);

    const token = getStoredAccessToken();

    if (!token || !jobId || !job) {
      setLoading(false);
      return;
    }

    try {
      await apiFetch<{ job: unknown }, Record<string, unknown>>(`/jobs/${jobId}`, {
        body: toJobPayload(job, "CLOSED"),
        method: "PUT",
        token,
      });
      router.push("/empresa/vagas");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel fechar a vaga.");
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <div className="form-card rounded-[8px] p-6 text-slate-600">
        Carregando dados da empresa...
      </div>
    );
  }

  return (
    <form className="form-card grid gap-5 rounded-[8px] p-6" onSubmit={handleSubmit}>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">Vaga</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          {isEditing ? "Editar vaga" : "Criar vaga para biologos"}
        </h1>
        <p className="mt-2 text-slate-600">
          Uma vaga completa precisa explicar atividade, local, modelo, remuneracao e requisitos
          tecnicos. Isso melhora o match e reduz candidaturas fora do perfil.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <GuideItem text="Titulo objetivo" />
          <GuideItem text="Descricao operacional" />
          <GuideItem text="Requisitos tecnicos" />
          <GuideItem text={canPublish ? "Pode publicar" : "Salvar como rascunho"} />
        </div>
        {!canPublish ? (
          <div className="mt-4 rounded-[8px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Sua empresa ainda nao esta verificada
            {companyStatus ? ` (${getCompanyStatusLabel(companyStatus)})` : ""}. Voce pode salvar a
            vaga como rascunho, mas so podera publicar apos aprovacao do administrador.
            <Button asChild className="mt-3" size="sm" variant="secondary">
              <Link href="/empresa">Ver dados da empresa</Link>
            </Button>
          </div>
        ) : null}
      </div>

      <Field defaultValue={job?.title} label="Titulo" name="title" required />
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Descricao da vaga
        <textarea
          className="field-input min-h-32 rounded-[8px] px-3 py-3"
          defaultValue={job?.description}
          name="description"
          placeholder="Descreva atividades, rotina, entregas esperadas, tipo de ambiente e criterios de selecao."
          required
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <Select
          label="Status"
          name="status"
          options={[
            ["DRAFT", "Rascunho"],
            ...(canPublish ? ([["PUBLISHED", "Publicada"]] as string[][]) : []),
            ...(isEditing ? ([["CLOSED", "Fechada"]] as string[][]) : []),
          ]}
          value={job?.status}
        />
        <Select
          label="Contrato"
          name="contractType"
          options={[
            ["CLT", "CLT"],
            ["PJ", "PJ"],
            ["FREELANCE", "Freelance"],
            ["INTERNSHIP", "Estagio"],
            ["TEMPORARY", "Temporario"],
          ]}
          value={job?.contractType}
        />
        <Select
          label="Modo"
          name="workMode"
          options={[
            ["FIELD", "Campo"],
            ["ON_SITE", "Presencial"],
            ["HYBRID", "Hibrido"],
            ["REMOTE", "Remoto"],
          ]}
          value={job?.workMode}
        />
        <Field defaultValue={job?.state} label="Estado" maxLength={2} name="state" required />
        <Field defaultValue={job?.city} label="Cidade" name="city" required />
        <Field
          defaultValue={centsToMoney(job?.salaryMinCents)}
          label="Salario minimo"
          name="salaryMin"
          type="number"
        />
        <Field
          defaultValue={centsToMoney(job?.salaryMaxCents)}
          label="Salario maximo"
          name="salaryMax"
          type="number"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Check
          defaultChecked={job?.requiresCrbio ?? true}
          label="Exige CRBio"
          name="requiresCrbio"
        />
        <Check
          defaultChecked={job?.acceptsStudents}
          label="Aceita estudantes"
          name="acceptsStudents"
        />
        <Check defaultChecked={job?.requiresTravel} label="Exige viagem" name="requiresTravel" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <TextArea
          defaultValue={job?.requiredPracticeAreas.join(", ")}
          label="Areas exigidas"
          name="requiredPracticeAreas"
        />
        <TextArea
          defaultValue={job?.requiredTaxonomicGroups.join(", ")}
          label="Grupos taxonomicos"
          name="requiredTaxonomicGroups"
        />
        <TextArea
          defaultValue={job?.requiredSkills.join(", ")}
          label="Competencias"
          name="requiredSkills"
        />
      </div>

      {error ? <p className="rounded-[8px] bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button disabled={loading} type="submit">
          {loading ? "Salvando..." : isEditing ? "Salvar vaga" : "Criar vaga"}
        </Button>
        <Button asChild type="button" variant="secondary">
          <Link href="/empresa/vagas">Voltar para vagas</Link>
        </Button>
        {isEditing && job?.status !== "CLOSED" ? (
          <Button disabled={loading} onClick={handleCloseJob} type="button" variant="secondary">
            Fechar vaga
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function GuideItem({ text }: { text: string }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700">
      {text}
    </div>
  );
}

function getCompanyStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "verificacao pendente",
    REJECTED: "rejeitada",
    UNVERIFIED: "nao verificada",
    VERIFIED: "verificada",
  };

  return labels[status] ?? status;
}

function Field({
  label,
  name,
  type = "text",
  ...props
}: {
  defaultValue?: string;
  label: string;
  maxLength?: number;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <input className="field-input h-11 rounded-[8px] px-3" name={name} type={type} {...props} />
    </label>
  );
}

function Select({
  label,
  name,
  options,
  value,
}: {
  label: string;
  name: string;
  options: string[][];
  value?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <select className="field-input h-11 rounded-[8px] px-3" defaultValue={value} name={name}>
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
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
    <label className="flex items-center gap-3 rounded-[8px] border border-cyan-100 bg-cyan-50/40 px-4 py-3 text-sm font-medium text-slate-700">
      <input defaultChecked={defaultChecked} name={name} type="checkbox" />
      {label}
    </label>
  );
}

function TextArea({
  defaultValue,
  label,
  name,
}: {
  defaultValue?: string;
  label: string;
  name: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <textarea
        className="field-input min-h-24 rounded-[8px] px-3 py-3"
        defaultValue={defaultValue}
        name={name}
        placeholder="Separe por virgula"
      />
    </label>
  );
}

function splitList(value: string) {
  return [
    ...new Set(
      value
        .split(/[,;\n]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

function moneyToCents(value: string) {
  return value ? Math.round(Number(value) * 100) : undefined;
}

function centsToMoney(value?: number | null) {
  return typeof value === "number" ? String(value / 100) : "";
}

function toJobPayload(job: Job, status: Job["status"]) {
  return {
    acceptsStudents: job.acceptsStudents,
    city: job.city,
    contractType: job.contractType,
    description: job.description,
    requiredPracticeAreas: job.requiredPracticeAreas,
    requiredSkills: job.requiredSkills,
    requiredTaxonomicGroups: job.requiredTaxonomicGroups,
    requiresCrbio: job.requiresCrbio,
    requiresTravel: job.requiresTravel,
    salaryMaxCents: job.salaryMaxCents ?? undefined,
    salaryMinCents: job.salaryMinCents ?? undefined,
    state: job.state,
    status,
    title: job.title,
    workMode: job.workMode,
  };
}
