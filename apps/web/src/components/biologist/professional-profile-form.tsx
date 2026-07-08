"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { apiFetch, apiUploadBiologistDocument, getStoredAccessToken } from "@/lib/api";

type NamedItem = {
  name: string;
};

type Experience = {
  description: string;
  endYear: string;
  isCurrent: boolean;
  organizationName: string;
  startYear: string;
  title: string;
};

type Certification = {
  credentialUrl: string;
  issuedYear: string;
  issuerName: string;
  name: string;
};

type DocumentItem = {
  fileUrl: string;
  title: string;
  type: "CRBIO" | "DIPLOMA" | "CERTIFICATE" | "PORTFOLIO" | "OTHER";
};

type ProfessionalResponse = {
  completion: number;
  professional: {
    certifications: Array<{
      credentialUrl: string | null;
      issuedYear: number | null;
      issuerName: string | null;
      name: string;
    }>;
    documents: Array<DocumentItem>;
    experiences: Array<
      Omit<Experience, "endYear" | "organizationName" | "startYear"> & {
        endYear: number | null;
        organizationName: string | null;
        startYear: number;
      }
    >;
    practiceAreas: NamedItem[];
    skills: NamedItem[];
    taxonomicGroups: NamedItem[];
  };
};

const emptyExperience: Experience = {
  description: "",
  endYear: "",
  isCurrent: false,
  organizationName: "",
  startYear: "",
  title: "",
};

const emptyCertification: Certification = {
  credentialUrl: "",
  issuedYear: "",
  issuerName: "",
  name: "",
};

const emptyDocument: DocumentItem = {
  fileUrl: "",
  title: "",
  type: "CRBIO",
};

export function ProfessionalProfileForm() {
  const router = useRouter();
  const [practiceAreas, setPracticeAreas] = useState("");
  const [taxonomicGroups, setTaxonomicGroups] = useState("");
  const [skills, setSkills] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([{ ...emptyExperience }]);
  const [certifications, setCertifications] = useState<Certification[]>([
    { ...emptyCertification },
  ]);
  const [documents, setDocuments] = useState<DocumentItem[]>([{ ...emptyDocument }]);
  const [documentFiles, setDocumentFiles] = useState<Record<number, File | null>>({});
  const [completion, setCompletion] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getStoredAccessToken();

    if (!token) {
      router.push("/login");
      return;
    }

    apiFetch<ProfessionalResponse>("/biologist-profile/me/professional", { token })
      .then((response) => {
        const professional = response.professional;
        setCompletion(response.completion);
        setPracticeAreas(professional.practiceAreas.map((item) => item.name).join(", "));
        setTaxonomicGroups(professional.taxonomicGroups.map((item) => item.name).join(", "));
        setSkills(professional.skills.map((item) => item.name).join(", "));
        setExperiences(
          professional.experiences.length
            ? professional.experiences.map((item) => ({
                description: item.description ?? "",
                endYear: item.endYear?.toString() ?? "",
                isCurrent: item.isCurrent,
                organizationName: item.organizationName ?? "",
                startYear: item.startYear.toString(),
                title: item.title,
              }))
            : [{ ...emptyExperience }],
        );
        setCertifications(
          professional.certifications.length
            ? professional.certifications.map((item) => ({
                credentialUrl: item.credentialUrl ?? "",
                issuedYear: item.issuedYear?.toString() ?? "",
                issuerName: item.issuerName ?? "",
                name: item.name,
              }))
            : [{ ...emptyCertification }],
        );
        setDocuments(
          professional.documents.length ? professional.documents : [{ ...emptyDocument }],
        );
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Complete o perfil basico antes do perfil profissional.",
        );
      });
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const token = getStoredAccessToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const documentsWithUploads = await Promise.all(
        documents.map(async (item, index) => {
          const file = documentFiles[index];

          if (!file) {
            return item;
          }

          const upload = await apiUploadBiologistDocument(file, token);

          return {
            ...item,
            fileUrl: upload.url,
            title: item.title.trim() || file.name,
          };
        }),
      );

      const response = await apiFetch<ProfessionalResponse, Record<string, unknown>>(
        "/biologist-profile/me/professional",
        {
          body: {
            certifications: certifications
              .filter((item) => item.name.trim())
              .map((item) => ({
                credentialUrl: item.credentialUrl.trim() || undefined,
                issuedYear: item.issuedYear ? Number(item.issuedYear) : undefined,
                issuerName: item.issuerName.trim() || undefined,
                name: item.name,
              })),
            documents: documentsWithUploads
              .filter((item) => item.title.trim() && item.fileUrl.trim())
              .map((item) => ({
                fileUrl: item.fileUrl,
                title: item.title,
                type: item.type,
              })),
            experiences: experiences
              .filter((item) => item.title.trim() && item.startYear)
              .map((item) => ({
                description: item.description.trim() || undefined,
                endYear: item.endYear ? Number(item.endYear) : undefined,
                isCurrent: item.isCurrent,
                organizationName: item.organizationName.trim() || undefined,
                startYear: Number(item.startYear),
                title: item.title,
              })),
            practiceAreas: splitList(practiceAreas),
            skills: splitList(skills),
            taxonomicGroups: splitList(taxonomicGroups),
          },
          method: "PUT",
          token,
        },
      );

      setCompletion(response.completion);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nao foi possivel salvar o perfil profissional.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-card grid gap-6 rounded-[8px] p-6" onSubmit={handleSubmit}>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Perfil profissional
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          Especialidades, documentos e historico
        </h1>
        {completion !== null ? (
          <p className="mt-2 text-slate-600">Conclusao atual: {completion}%</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <TextArea label="Areas de atuacao" onChange={setPracticeAreas} value={practiceAreas} />
        <TextArea
          label="Grupos taxonomicos"
          onChange={setTaxonomicGroups}
          value={taxonomicGroups}
        />
        <TextArea label="Competencias tecnicas" onChange={setSkills} value={skills} />
      </div>

      <SectionTitle title="Experiencias" />
      <div className="grid gap-4">
        {experiences.map((experience, index) => (
          <div
            className="grid gap-4 rounded-[8px] border border-cyan-100 bg-cyan-50/40 p-4"
            key={index}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Titulo"
                onChange={(value) =>
                  updateItem(experiences, setExperiences, index, { title: value })
                }
                value={experience.title}
              />
              <Field
                label="Organizacao"
                onChange={(value) =>
                  updateItem(experiences, setExperiences, index, { organizationName: value })
                }
                value={experience.organizationName}
              />
              <Field
                label="Ano inicial"
                onChange={(value) =>
                  updateItem(experiences, setExperiences, index, { startYear: value })
                }
                type="number"
                value={experience.startYear}
              />
              <Field
                label="Ano final"
                onChange={(value) =>
                  updateItem(experiences, setExperiences, index, { endYear: value })
                }
                type="number"
                value={experience.endYear}
              />
            </div>
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <input
                checked={experience.isCurrent}
                onChange={(event) =>
                  updateItem(experiences, setExperiences, index, {
                    isCurrent: event.target.checked,
                  })
                }
                type="checkbox"
              />
              Experiencia atual
            </label>
            <TextArea
              label="Descricao"
              onChange={(value) =>
                updateItem(experiences, setExperiences, index, { description: value })
              }
              value={experience.description}
            />
            <RemoveButton
              onClick={() => removeItem(experiences, setExperiences, index, emptyExperience)}
            />
          </div>
        ))}
        <Button
          onClick={() => setExperiences([...experiences, { ...emptyExperience }])}
          type="button"
          variant="secondary"
        >
          Adicionar experiencia
        </Button>
      </div>

      <SectionTitle title="Certificacoes" />
      <div className="grid gap-4">
        {certifications.map((certification, index) => (
          <div
            className="grid gap-4 rounded-[8px] border border-cyan-100 bg-cyan-50/40 p-4 md:grid-cols-2"
            key={index}
          >
            <Field
              label="Nome"
              onChange={(value) =>
                updateItem(certifications, setCertifications, index, { name: value })
              }
              value={certification.name}
            />
            <Field
              label="Emissor"
              onChange={(value) =>
                updateItem(certifications, setCertifications, index, { issuerName: value })
              }
              value={certification.issuerName}
            />
            <Field
              label="Ano"
              onChange={(value) =>
                updateItem(certifications, setCertifications, index, { issuedYear: value })
              }
              type="number"
              value={certification.issuedYear}
            />
            <Field
              label="URL da credencial"
              onChange={(value) =>
                updateItem(certifications, setCertifications, index, { credentialUrl: value })
              }
              type="url"
              value={certification.credentialUrl}
            />
            <RemoveButton
              onClick={() =>
                removeItem(certifications, setCertifications, index, emptyCertification)
              }
            />
          </div>
        ))}
        <Button
          onClick={() => setCertifications([...certifications, { ...emptyCertification }])}
          type="button"
          variant="secondary"
        >
          Adicionar certificacao
        </Button>
      </div>

      <SectionTitle title="Documentos" />
      <div className="grid gap-4">
        {documents.map((document, index) => (
          <div
            className="grid gap-4 rounded-[8px] border border-cyan-100 bg-cyan-50/40 p-4 md:grid-cols-3"
            key={index}
          >
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Tipo
              <select
                className="field-input h-11 rounded-[8px] px-3"
                onChange={(event) =>
                  updateItem(documents, setDocuments, index, {
                    type: event.target.value as DocumentItem["type"],
                  })
                }
                value={document.type}
              >
                <option value="CRBIO">CRBio</option>
                <option value="DIPLOMA">Diploma</option>
                <option value="CERTIFICATE">Certificado</option>
                <option value="PORTFOLIO">Portfolio</option>
                <option value="OTHER">Outro</option>
              </select>
            </label>
            <Field
              label="Titulo"
              onChange={(value) => updateItem(documents, setDocuments, index, { title: value })}
              value={document.title}
            />
            <Field
              label="URL externa opcional"
              onChange={(value) => updateItem(documents, setDocuments, index, { fileUrl: value })}
              type="url"
              value={document.fileUrl}
            />
            <DocumentUploadButton
              file={documentFiles[index] ?? null}
              onChange={(file) =>
                setDocumentFiles((current) => ({
                  ...current,
                  [index]: file,
                }))
              }
            />
            <RemoveButton
              onClick={() => {
                removeItem(documents, setDocuments, index, emptyDocument);
                setDocumentFiles((current) => {
                  const next = { ...current };
                  delete next[index];
                  return next;
                });
              }}
            />
          </div>
        ))}
        <Button
          onClick={() => setDocuments([...documents, { ...emptyDocument }])}
          type="button"
          variant="secondary"
        >
          Adicionar documento
        </Button>
      </div>

      {error ? <p className="rounded-[8px] bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <Button disabled={loading} type="submit">
        {loading ? "Salvando..." : "Salvar perfil profissional"}
      </Button>
    </form>
  );
}

function DocumentUploadButton({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="grid gap-3 rounded-[8px] border border-dashed border-cyan-300 bg-white p-4 text-sm font-medium text-slate-700 md:col-span-3">
      <span>Arquivo do documento</span>
      <span className="inline-flex w-fit cursor-pointer rounded-[8px] bg-cyan-700 px-4 py-2 text-sm font-semibold text-white">
        Selecionar arquivo
      </span>
      <input
        accept="application/pdf,image/jpeg,image/png"
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        type="file"
      />
      <span className="text-xs text-slate-500">
        PDF, JPG ou PNG ate 5 MB. Ao salvar, o sistema envia o arquivo e gera o link
        automaticamente.
      </span>
      {file ? (
        <span className="rounded-[8px] bg-cyan-50 px-3 py-2 text-sm text-cyan-900">
          Selecionado: {file.name}
        </span>
      ) : null}
    </label>
  );
}

function Field({
  label,
  onChange,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <input
        className="field-input h-11 rounded-[8px] px-3"
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </label>
  );
}

function TextArea({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <textarea
        className="field-input min-h-28 rounded-[8px] px-3 py-3"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="border-t border-slate-200 pt-6 text-xl font-semibold text-slate-950">{title}</h2>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <Button className="md:w-fit" onClick={onClick} type="button" variant="ghost">
      Remover
    </Button>
  );
}

function updateItem<T>(
  items: T[],
  setItems: (items: T[]) => void,
  index: number,
  patch: Partial<T>,
) {
  setItems(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
}

function removeItem<T>(items: T[], setItems: (items: T[]) => void, index: number, fallback: T) {
  const next = items.filter((_, itemIndex) => itemIndex !== index);
  setItems(next.length ? next : [{ ...fallback }]);
}

function splitList(value: string) {
  return [
    ...new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}
