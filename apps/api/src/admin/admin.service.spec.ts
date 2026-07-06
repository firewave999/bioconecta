import { NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import { AdminService } from "./admin.service.js";

describe("AdminService", () => {
  it("returns operational counters", async () => {
    const { repositories, service } = createService();

    repositories.applications.count.mockResolvedValueOnce(8);
    repositories.biologists.count.mockResolvedValueOnce(5).mockResolvedValueOnce(3);
    repositories.companies.count.mockResolvedValueOnce(4).mockResolvedValueOnce(2);
    repositories.jobs.count.mockResolvedValueOnce(6).mockResolvedValueOnce(4);
    repositories.users.count.mockResolvedValueOnce(10);

    await expect(service.getOverview()).resolves.toEqual({
      applicationsCount: 8,
      biologistProfilesCount: 5,
      companiesCount: 4,
      jobsCount: 6,
      publishedJobsCount: 4,
      usersCount: 10,
      verifiedBiologistsCount: 3,
      verifiedCompaniesCount: 2,
    });

    expect(repositories.biologists.count).toHaveBeenLastCalledWith({
      where: { verificationStatus: "VERIFIED" },
    });
    expect(repositories.jobs.count).toHaveBeenLastCalledWith({
      where: { status: "PUBLISHED" },
    });
  });

  it("does not expose passwordHash when listing users", async () => {
    const { repositories, service } = createService();

    repositories.users.find.mockResolvedValueOnce([
      createUser({ email: "admin@bioconecta.local", passwordHash: "secret" }),
    ]);

    const users = await service.listUsers();

    expect(users).toEqual([
      expect.objectContaining({
        email: "admin@bioconecta.local",
        roles: ["ADMIN"],
      }),
    ]);
    expect(users[0]).not.toHaveProperty("passwordHash");
  });

  it("does not expose owner passwordHash when listing companies", async () => {
    const { repositories, service } = createService();

    repositories.companies.find.mockResolvedValueOnce([
      {
        id: "company-id",
        name: "Eco Teste",
        owner: createUser({ email: "owner@bioconecta.local", passwordHash: "secret" }),
      },
    ]);

    const companies = await service.listCompanies();

    expect(companies[0]).toEqual(
      expect.objectContaining({
        id: "company-id",
        owner: expect.objectContaining({
          email: "owner@bioconecta.local",
        }),
      }),
    );
    expect(companies[0].owner).not.toHaveProperty("passwordHash");
  });

  it("updates company verification status", async () => {
    const { repositories, service } = createService();
    const company = { id: "company-id", verificationStatus: "UNVERIFIED" };

    repositories.companies.findOne.mockResolvedValueOnce(company);
    repositories.companies.save.mockImplementationOnce(async (value) => value);

    await expect(
      service.updateCompanyVerificationStatus("company-id", {
        verificationStatus: "VERIFIED",
      }),
    ).resolves.toEqual({
      id: "company-id",
      verificationStatus: "VERIFIED",
    });
  });

  it("throws when company does not exist", async () => {
    const { repositories, service } = createService();

    repositories.companies.findOne.mockResolvedValueOnce(null);

    await expect(
      service.updateCompanyVerificationStatus("missing-id", {
        verificationStatus: "REJECTED",
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it("sets publishedAt when publishing a job for the first time", async () => {
    const { repositories, service } = createService();
    const job = { id: "job-id", publishedAt: null, status: "DRAFT" };

    repositories.jobs.findOne.mockResolvedValueOnce(job);
    repositories.jobs.save.mockImplementationOnce(async (value) => value);

    const updated = await service.updateJobStatus("job-id", { status: "PUBLISHED" });

    expect(updated.status).toBe("PUBLISHED");
    expect(updated.publishedAt).toBeInstanceOf(Date);
  });
});

function createService() {
  const repositories = {
    applications: createRepository(),
    biologists: createRepository(),
    companies: createRepository(),
    jobs: createRepository(),
    users: createRepository(),
  };

  return {
    repositories,
    service: new AdminService(
      repositories.applications,
      repositories.biologists,
      repositories.companies,
      repositories.jobs,
      repositories.users,
    ),
  };
}

function createRepository() {
  return {
    count: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    save: vi.fn(),
  };
}

function createUser(overrides: { email: string; passwordHash: string }) {
  return {
    blockedAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    deletedAt: null,
    email: overrides.email,
    emailVerifiedAt: null,
    firstName: "Admin",
    id: "user-id",
    lastName: "Teste",
    passwordHash: overrides.passwordHash,
    phone: null,
    roles: ["ADMIN"],
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}
