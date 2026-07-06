import { ConflictException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import { ApplicationsService } from "./applications.service.js";

describe("ApplicationsService", () => {
  it("creates an application with transparent match score", async () => {
    const { repositories, service } = createService();

    repositories.jobs.findOne.mockResolvedValueOnce({
      acceptsStudents: false,
      company: { id: "company-id", name: "Eco" },
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
});

function createService() {
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
    repositories,
    service: new ApplicationsService(
      repositories.applications,
      repositories.profiles,
      repositories.companies,
      repositories.jobs,
      repositories.practiceAreas,
      repositories.taxonomicGroups,
      repositories.skills,
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
