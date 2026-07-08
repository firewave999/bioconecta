import { ConflictException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import { ApplicationsService } from "./applications.service.js";

describe("ApplicationsService", () => {
  it("creates an application with transparent match score", async () => {
    const { notifications, repositories, service } = createService();

    repositories.jobs.findOne.mockResolvedValueOnce({
      acceptsStudents: false,
      company: { id: "company-id", name: "Eco", ownerUserId: "company-user-id" },
      id: "job-id",
      requiredPracticeAreas: ["Fauna"],
      requiredSkills: ["Geoprocessamento"],
      requiredTaxonomicGroups: ["Aves"],
      requiresCrbio: true,
      requiresTravel: true,
      state: "SP",
      status: "PUBLISHED",
    });
    repositories.profiles.findOneBy.mockResolvedValueOnce({
      acceptsTravel: true,
      id: "profile-id",
      fullName: "Ana E2E",
      registrationStatus: "ACTIVE",
      state: "SP",
      userId: "user-id",
    });
    repositories.applications.findOneBy.mockResolvedValueOnce(null);
    repositories.practiceAreas.createQueryBuilder.mockReturnValueOnce(
      createQueryBuilder([{ name: "Fauna" }]),
    );
    repositories.taxonomicGroups.createQueryBuilder.mockReturnValueOnce(
      createQueryBuilder([{ name: "Aves" }]),
    );
    repositories.skills.createQueryBuilder.mockReturnValueOnce(
      createQueryBuilder([{ name: "Geoprocessamento" }]),
    );
    repositories.applications.create.mockImplementationOnce((value) => ({
      id: "application-id",
      ...value,
    }));
    repositories.applications.save.mockImplementationOnce(async (value) => value);

    const result = await service.apply("user-id", "job-id", {
      coverMessage: " Tenho experiencia em campo. ",
    });

    expect(result.application).toEqual(
      expect.objectContaining({
        biologistProfileId: "profile-id",
        coverMessage: "Tenho experiencia em campo.",
        jobId: "job-id",
        matchScore: 100,
        status: "APPLIED",
      }),
    );
    expect(result.match.reasons).toContain("1/1 area(s) em comum.");
    expect(result.match.reasons).toContain("CRBio compativel com a exigencia da vaga.");
    expect(notifications.createForUser).toHaveBeenCalledWith(
      expect.objectContaining({
        actionUrl: "/empresa/vagas/job-id/candidatos",
        title: "Nova candidatura recebida",
        type: "APPLICATION_CREATED",
        userId: "company-user-id",
      }),
    );
  });

  it("rejects applications for unpublished jobs", async () => {
    const { repositories, service } = createService();

    repositories.jobs.findOne.mockResolvedValueOnce({ id: "job-id", status: "DRAFT" });
    repositories.profiles.findOneBy.mockResolvedValueOnce({ id: "profile-id" });

    await expect(service.apply("user-id", "job-id", {})).rejects.toThrow(NotFoundException);
  });

  it("requires a biologist profile before applying", async () => {
    const { repositories, service } = createService();

    repositories.jobs.findOne.mockResolvedValueOnce({ id: "job-id", status: "PUBLISHED" });
    repositories.profiles.findOneBy.mockResolvedValueOnce(null);

    await expect(service.apply("user-id", "job-id", {})).rejects.toThrow(NotFoundException);
  });

  it("blocks duplicated applications", async () => {
    const { repositories, service } = createService();

    repositories.jobs.findOne.mockResolvedValueOnce({ id: "job-id", status: "PUBLISHED" });
    repositories.profiles.findOneBy.mockResolvedValueOnce({ id: "profile-id" });
    repositories.applications.findOneBy.mockResolvedValueOnce({ id: "application-id" });

    await expect(service.apply("user-id", "job-id", {})).rejects.toThrow(ConflictException);
  });

  it("returns candidate contact data for the company job candidates view", async () => {
    const { repositories, service } = createService();

    repositories.companies.findOneBy.mockResolvedValueOnce({ id: "company-id" });
    repositories.jobs.findOneBy.mockResolvedValueOnce({
      companyId: "company-id",
      id: "job-id",
      title: "Biologo de campo",
    });
    repositories.applications.find.mockResolvedValueOnce([
      {
        biologistProfileId: "profile-id",
        biologistProfile: {
          avatarUrl: null,
          city: "Curitiba",
          fullName: "Ana Silva",
          headline: "Fauna e licenciamento",
          id: "profile-id",
          state: "PR",
          user: {
            email: "ana@example.com",
            firstName: "Ana",
            id: "user-id",
            lastName: "Silva",
            passwordHash: "secret",
            phone: "41999999999",
          },
          verificationStatus: "VERIFIED",
        },
        coverMessage: "Tenho experiencia na area.",
        id: "application-id",
        matchScore: 88,
        status: "APPLIED",
      },
    ]);
    repositories.practiceAreas.createQueryBuilder.mockReturnValueOnce(
      createQueryBuilder([{ name: "Fauna" }]),
    );
    repositories.taxonomicGroups.createQueryBuilder.mockReturnValueOnce(
      createQueryBuilder([{ name: "Aves" }]),
    );
    repositories.skills.createQueryBuilder.mockReturnValueOnce(
      createQueryBuilder([{ name: "Geoprocessamento" }]),
    );
    repositories.profiles.manager.query
      .mockResolvedValueOnce([
        {
          description: "Monitoramento em campo.",
          end_year: null,
          is_current: true,
          organization_name: "Eco Consultoria",
          start_year: 2022,
          title: "Analista ambiental",
        },
      ])
      .mockResolvedValueOnce([
        {
          credential_url: "https://example.com/certificado",
          issued_year: 2023,
          issuer_name: "Instituto Bio",
          name: "Inventario de fauna",
        },
      ])
      .mockResolvedValueOnce([
        {
          file_url: "https://example.com/crbio.pdf",
          title: "CRBio",
          type: "CRBIO",
          verification_status: "PENDING",
        },
      ]);

    const result = await service.listForJob("company-user-id", "job-id");

    expect(result.applications[0]).toMatchObject({
      biologistProfile: {
        user: {
          email: "ana@example.com",
          firstName: "Ana",
          id: "user-id",
          lastName: "Silva",
          phone: "41999999999",
        },
      },
    });
    expect(result.applications[0].biologistProfile.user).not.toHaveProperty("passwordHash");
    expect(result.applications[0].professional).toMatchObject({
      certifications: [{ name: "Inventario de fauna" }],
      documents: [{ title: "CRBio" }],
      experiences: [{ title: "Analista ambiental" }],
      practiceAreas: ["Fauna"],
      skills: ["Geoprocessamento"],
      taxonomicGroups: ["Aves"],
    });
    expect(repositories.applications.find).toHaveBeenCalledWith(
      expect.objectContaining({
        relations: { biologistProfile: { user: true } },
        where: { jobId: "job-id" },
      }),
    );
  });

  it("notifies the biologist when application status changes", async () => {
    const { notifications, repositories, service } = createService();

    repositories.companies.findOneBy.mockResolvedValueOnce({ id: "company-id" });
    repositories.applications.findOne.mockResolvedValueOnce({
      biologistProfile: { userId: "biologist-user-id" },
      id: "application-id",
      job: { companyId: "company-id", id: "job-id", title: "Biologo de aves" },
      jobId: "job-id",
      status: "APPLIED",
    });
    repositories.applications.save.mockImplementationOnce(async (value) => value);

    const result = await service.updateStatus("company-user-id", "application-id", {
      status: "INTERVIEW",
    });

    expect(result.application.status).toBe("INTERVIEW");
    expect(notifications.createForUser).toHaveBeenCalledWith(
      expect.objectContaining({
        actionUrl: "/candidaturas",
        title: "Status da candidatura atualizado",
        type: "APPLICATION_STATUS_UPDATED",
        userId: "biologist-user-id",
      }),
    );
  });
});

function createService() {
  const notifications = {
    createForUser: vi.fn(async (value) => value),
  };
  const repositories = {
    applications: createRepository(),
    companies: createRepository(),
    jobs: createRepository(),
    practiceAreas: createRepository(),
    profiles: createRepository(),
    skills: createRepository(),
    taxonomicGroups: createRepository(),
  };

  return {
    notifications,
    repositories,
    service: new ApplicationsService(
      repositories.applications,
      repositories.profiles,
      repositories.companies,
      repositories.jobs,
      repositories.practiceAreas,
      repositories.taxonomicGroups,
      repositories.skills,
      notifications,
    ),
  };
}

function createRepository() {
  return {
    create: vi.fn((value) => value),
    createQueryBuilder: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    findOneBy: vi.fn(),
    manager: {
      query: vi.fn(async () => []),
    },
    save: vi.fn(),
  };
}

function createQueryBuilder(values: Array<{ name: string }>) {
  return {
    getMany: vi.fn(async () => values),
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  };
}
