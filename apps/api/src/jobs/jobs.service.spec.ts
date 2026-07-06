import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import { JobsService } from "./jobs.service.js";

describe("JobsService", () => {
  it("creates a normalized published job for the user's company", async () => {
    const { repositories, service } = createService();

    repositories.companies.findOneBy.mockResolvedValueOnce({ id: "company-id" });
    repositories.jobs.create.mockImplementationOnce((value) => ({ id: "job-id", ...value }));
    repositories.jobs.save.mockImplementationOnce(async (value) => value);

    const result = await service.createMine("owner-id", createJobDto());

    expect(result.job).toEqual(
      expect.objectContaining({
        city: "Sao Paulo",
        companyId: "company-id",
        description: "Monitoramento de fauna.",
        requiredPracticeAreas: ["Fauna", "Licenciamento"],
        requiredSkills: ["Geoprocessamento"],
        requiredTaxonomicGroups: ["Aves"],
        state: "SP",
        status: "PUBLISHED",
        title: "Biologo de campo",
      }),
    );
    expect(result.job.publishedAt).toBeInstanceOf(Date);
  });

  it("requires a company before creating jobs", async () => {
    const { repositories, service } = createService();

    repositories.companies.findOneBy.mockResolvedValueOnce(null);

    await expect(service.createMine("owner-id", createJobDto())).rejects.toThrow(NotFoundException);
  });

  it("sets publishedAt when updating a draft to published", async () => {
    const { repositories, service } = createService();

    repositories.companies.findOneBy.mockResolvedValueOnce({ id: "company-id" });
    repositories.jobs.findOneBy.mockResolvedValueOnce({
      companyId: "company-id",
      id: "job-id",
      publishedAt: null,
      status: "DRAFT",
    });
    repositories.jobs.create.mockImplementationOnce((value) => value);
    repositories.jobs.save.mockImplementationOnce(async (value) => value);

    const result = await service.updateMine("owner-id", "job-id", createJobDto());

    expect(result.job.status).toBe("PUBLISHED");
    expect(result.job.publishedAt).toBeInstanceOf(Date);
  });

  it("blocks updates to jobs from another company", async () => {
    const { repositories, service } = createService();

    repositories.companies.findOneBy.mockResolvedValueOnce({ id: "company-id" });
    repositories.jobs.findOneBy.mockResolvedValueOnce({
      companyId: "other-company-id",
      id: "job-id",
    });

    await expect(service.updateMine("owner-id", "job-id", createJobDto())).rejects.toThrow(
      ForbiddenException,
    );
  });

  it("applies published job filters to the query builder", async () => {
    const { repositories, service } = createService();
    const builder = createQueryBuilder([{ id: "job-id" }]);

    repositories.jobs.createQueryBuilder.mockReturnValueOnce(builder);

    const result = await service.listPublished({
      city: " paulo ",
      contractType: "PJ",
      q: " fauna ",
      requirement: "Aves",
      state: " sp ",
      workMode: "FIELD",
    });

    expect(result.jobs).toEqual([{ id: "job-id" }]);
    expect(builder.where).toHaveBeenCalledWith("job.status = :status", {
      status: "PUBLISHED",
    });
    expect(builder.andWhere).toHaveBeenCalledWith("job.state = :state", { state: "SP" });
    expect(builder.andWhere).toHaveBeenCalledWith("job.city ILIKE :city", { city: "%paulo%" });
    expect(builder.andWhere).toHaveBeenCalledWith("job.work_mode = :workMode", {
      workMode: "FIELD",
    });
    expect(builder.andWhere).toHaveBeenCalledWith("job.contract_type = :contractType", {
      contractType: "PJ",
    });
  });
});

function createService() {
  const repositories = {
    companies: createRepository(),
    jobs: createRepository(),
  };

  return {
    repositories,
    service: new JobsService(repositories.companies, repositories.jobs),
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

function createQueryBuilder(jobs: Array<{ id: string }>) {
  return {
    addOrderBy: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    getMany: vi.fn(async () => jobs),
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  };
}

function createJobDto() {
  return {
    acceptsStudents: false,
    city: " Sao Paulo ",
    contractType: "PJ" as const,
    description: " Monitoramento de fauna. ",
    requiredPracticeAreas: ["Fauna", "Fauna", " Licenciamento ", ""],
    requiredSkills: [" Geoprocessamento "],
    requiredTaxonomicGroups: [" Aves "],
    requiresCrbio: true,
    requiresTravel: true,
    salaryMaxCents: undefined,
    salaryMinCents: 500000,
    state: " sp ",
    status: "PUBLISHED" as const,
    title: " Biologo de campo ",
    workMode: "FIELD" as const,
  };
}
