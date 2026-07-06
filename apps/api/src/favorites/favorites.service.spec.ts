import { ConflictException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import { FavoritesService } from "./favorites.service.js";

describe("FavoritesService", () => {
  it("lists saved jobs for a user", async () => {
    const { repositories, service } = createService();
    const savedJobs = [{ id: "saved-id", jobId: "job-id", userId: "user-id" }];

    repositories.savedJobs.find.mockResolvedValueOnce(savedJobs);

    await expect(service.listSavedJobs("user-id")).resolves.toEqual({ savedJobs });
    expect(repositories.savedJobs.find).toHaveBeenCalledWith({
      order: { createdAt: "DESC" },
      relations: { job: { company: true } },
      where: { userId: "user-id" },
    });
  });

  it("saves a published job", async () => {
    const { repositories, service } = createService();

    repositories.jobs.findOneBy.mockResolvedValueOnce({ id: "job-id", status: "PUBLISHED" });
    repositories.savedJobs.findOneBy.mockResolvedValueOnce(null);
    repositories.savedJobs.create.mockImplementationOnce((value) => ({ id: "saved-id", ...value }));
    repositories.savedJobs.save.mockImplementationOnce(async (value) => value);

    await expect(service.saveJob("user-id", "job-id")).resolves.toEqual({
      savedJob: {
        id: "saved-id",
        jobId: "job-id",
        userId: "user-id",
      },
    });
  });

  it("rejects saving unpublished or missing jobs", async () => {
    const { repositories, service } = createService();

    repositories.jobs.findOneBy.mockResolvedValueOnce(null);

    await expect(service.saveJob("user-id", "job-id")).rejects.toThrow(NotFoundException);
    expect(repositories.jobs.findOneBy).toHaveBeenCalledWith({
      id: "job-id",
      status: "PUBLISHED",
    });
  });

  it("rejects duplicated saved jobs", async () => {
    const { repositories, service } = createService();

    repositories.jobs.findOneBy.mockResolvedValueOnce({ id: "job-id", status: "PUBLISHED" });
    repositories.savedJobs.findOneBy.mockResolvedValueOnce({ id: "saved-id" });

    await expect(service.saveJob("user-id", "job-id")).rejects.toThrow(ConflictException);
  });

  it("removes a saved job", async () => {
    const { repositories, service } = createService();

    repositories.savedJobs.delete.mockResolvedValueOnce({ affected: 1 });

    await expect(service.unsaveJob("user-id", "job-id")).resolves.toEqual({ success: true });
    expect(repositories.savedJobs.delete).toHaveBeenCalledWith({
      jobId: "job-id",
      userId: "user-id",
    });
  });

  it("returns saved state", async () => {
    const { repositories, service } = createService();

    repositories.savedJobs.findOneBy.mockResolvedValueOnce({ id: "saved-id" });

    await expect(service.getSavedState("user-id", "job-id")).resolves.toEqual({ saved: true });
  });
});

function createService() {
  const repositories = {
    jobs: createRepository(),
    savedJobs: createRepository(),
  };

  return {
    repositories,
    service: new FavoritesService(repositories.jobs, repositories.savedJobs),
  };
}

function createRepository() {
  return {
    create: vi.fn((value) => value),
    delete: vi.fn(),
    find: vi.fn(),
    findOneBy: vi.fn(),
    save: vi.fn(),
  };
}
