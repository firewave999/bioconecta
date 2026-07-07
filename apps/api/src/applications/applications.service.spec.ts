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
