import { ForbiddenException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import { BiologistProfileService } from "./biologist-profile.service.js";

function createQueryBuilder(rows: unknown[]) {
  const builder = {
    andWhere: vi.fn(),
    getMany: vi.fn(async () => rows),
    orderBy: vi.fn(),
    take: vi.fn(),
    where: vi.fn(),
  };

  builder.andWhere.mockReturnValue(builder);
  builder.orderBy.mockReturnValue(builder);
  builder.take.mockReturnValue(builder);
  builder.where.mockReturnValue(builder);

  return builder;
}

function createService(options: { roles: string[]; rows?: unknown[] }) {
  const builder = createQueryBuilder(options.rows ?? []);
  const dataSource = { query: vi.fn(async () => []) };
  const profilesRepository = { createQueryBuilder: vi.fn(() => builder) };
  const usersRepository = {
    findOneByOrFail: vi.fn(async () => ({ roles: options.roles })),
  };

  const service = new BiologistProfileService(
    dataSource as never,
    profilesRepository as never,
    usersRepository as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

  return { builder, dataSource, service };
}

describe("BiologistProfileService.searchForCompanies", () => {
  it("bloqueia contas de biologo", async () => {
    const { service } = createService({ roles: ["BIOLOGIST"] });

    await expect(service.searchForCompanies("user-id", {})).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it("esconde perfis rejeitados ou suspensos e aplica os filtros de empresa", async () => {
    const { builder, service } = createService({ roles: ["COMPANY"] });

    await service.searchForCompanies("user-id", {
      hasDriverLicense: "true",
      state: "mg",
      verifiedOnly: "true",
    });

    expect(builder.where).toHaveBeenCalledWith(
      "profile.verificationStatus NOT IN (:...hidden)",
      { hidden: ["REJECTED", "SUSPENDED"] },
    );
    expect(builder.andWhere).toHaveBeenCalledWith("profile.state = :state", { state: "MG" });
    expect(builder.andWhere).toHaveBeenCalledWith("profile.verificationStatus = :verified", {
      verified: "VERIFIED",
    });
    expect(builder.andWhere).toHaveBeenCalledWith("profile.hasDriverLicense = true");
  });

  it("nao devolve CPF, data de nascimento nem contato", async () => {
    const { service } = createService({
      roles: ["COMPANY"],
      rows: [
        {
          acceptsTravel: false,
          availabilityStatus: "AVAILABLE_NOW",
          availableFrom: null,
          avatarUrl: null,
          birthDate: "1990-01-01",
          city: "Belo Horizonte",
          cpf: "00000000000",
          email: "bio@example.com",
          fullName: "Ana Biologa",
          hasCnpj: false,
          hasDriverLicense: true,
          hasOwnVehicle: false,
          headline: "Herpetologia",
          id: "profile-id",
          issuesInvoice: false,
          phone: "31999999999",
          state: "MG",
          verificationStatus: "VERIFIED",
        },
      ],
    });

    const result = await service.searchForCompanies("user-id", {});
    const [biologist] = result.biologists;

    expect(biologist).toEqual(
      expect.objectContaining({ fullName: "Ana Biologa", id: "profile-id", practiceAreas: [] }),
    );
    expect(biologist).not.toHaveProperty("cpf");
    expect(biologist).not.toHaveProperty("birthDate");
    expect(biologist).not.toHaveProperty("email");
    expect(biologist).not.toHaveProperty("phone");
  });
});
