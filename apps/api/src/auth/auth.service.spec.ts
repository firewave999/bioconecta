import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { hash } from "bcryptjs";
import { describe, expect, it, vi } from "vitest";

import { AuthService } from "./auth.service.js";

describe("AuthService", () => {
  it("registers a user with normalized data and hides passwordHash", async () => {
    const { repositories, service } = createService();

    repositories.users.findOne.mockResolvedValueOnce(null);

    const result = await service.register(
      {
        acceptPrivacy: true,
        acceptTerms: true,
        email: "  BIO@EXAMPLE.COM ",
        firstName: " Ana ",
        lastName: " Silva ",
        password: "SenhaTeste123",
        phone: " 11999999999 ",
        role: "BIOLOGIST",
      },
      { ipAddress: "127.0.0.1", userAgent: "vitest" },
    );

    expect(result.user).toEqual(
      expect.objectContaining({
        email: "bio@example.com",
        firstName: "Ana",
        lastName: "Silva",
        phone: "11999999999",
        roles: ["BIOLOGIST"],
      }),
    );
    expect(result.user).not.toHaveProperty("passwordHash");
    expect(result.devVerificationToken).toBeTruthy();
    expect(result.tokens).toEqual(
      expect.objectContaining({
        accessToken: "signed-access-token",
        expiresIn: 900,
      }),
    );
  });

  it("rejects registration without accepted terms and privacy", async () => {
    const { service } = createService();

    await expect(
      service.register(
        {
          acceptPrivacy: false,
          acceptTerms: true,
          email: "bio@example.com",
          firstName: "Ana",
          lastName: "Silva",
          password: "SenhaTeste123",
          role: "BIOLOGIST",
        },
        {},
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects duplicated registration email", async () => {
    const { repositories, service } = createService();

    repositories.users.findOne.mockResolvedValueOnce(createUser({ email: "bio@example.com" }));

    await expect(
      service.register(
        {
          acceptPrivacy: true,
          acceptTerms: true,
          email: "bio@example.com",
          firstName: "Ana",
          lastName: "Silva",
          password: "SenhaTeste123",
          role: "BIOLOGIST",
        },
        {},
      ),
    ).rejects.toThrow(ConflictException);
  });

  it("logs in with a valid password", async () => {
    const { repositories, service } = createService();

    repositories.users.findOne.mockResolvedValueOnce(
      createUser({
        email: "bio@example.com",
        passwordHash: await hash("SenhaTeste123", 4),
      }),
    );

    const result = await service.login(
      { email: " BIO@example.com ", password: "SenhaTeste123" },
      { userAgent: "vitest" },
    );

    expect(result.user.email).toBe("bio@example.com");
    expect(result.tokens.accessToken).toBe("signed-access-token");
  });

  it("rejects invalid login credentials", async () => {
    const { repositories, service } = createService();

    repositories.users.findOne.mockResolvedValueOnce(
      createUser({
        email: "bio@example.com",
        passwordHash: await hash("SenhaTeste123", 4),
      }),
    );

    await expect(
      service.login({ email: "bio@example.com", password: "senha-errada" }, {}),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("rejects blocked users on login", async () => {
    const { repositories, service } = createService();

    repositories.users.findOne.mockResolvedValueOnce(
      createUser({
        blockedAt: new Date("2026-01-02T00:00:00.000Z"),
        email: "bio@example.com",
        passwordHash: await hash("SenhaTeste123", 4),
      }),
    );

    await expect(
      service.login({ email: "bio@example.com", password: "SenhaTeste123" }, {}),
    ).rejects.toThrow(ForbiddenException);
  });
});

function createService() {
  const repositories = {
    emailTokens: {
      create: vi.fn((value) => ({ id: "email-token-id", ...value })),
      findOne: vi.fn(),
      save: vi.fn(async (value) => value),
      update: vi.fn(),
    },
    sessions: {
      create: vi.fn((value) => ({ id: "session-id", ...value })),
      findOneBy: vi.fn(),
      save: vi.fn(async (value) => value),
      update: vi.fn(),
    },
    users: {
      create: vi.fn((value) => ({
        id: "user-id",
        blockedAt: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        deletedAt: null,
        emailVerifiedAt: null,
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        ...value,
      })),
      findOne: vi.fn(),
      findOneByOrFail: vi.fn(),
      save: vi.fn(async (value) => value),
    },
  };

  const configService = {
    get: vi.fn((key: string) => {
      const values: Record<string, string | number> = {
        EMAIL_VERIFICATION_TOKEN_TTL_HOURS: 24,
        JWT_ACCESS_SECRET: "test-secret",
        JWT_ACCESS_TOKEN_TTL_SECONDS: 900,
        JWT_REFRESH_TOKEN_TTL_DAYS: 30,
        NODE_ENV: "development",
      };

      return values[key];
    }),
  };

  const jwtService = {
    signAsync: vi.fn(async () => "signed-access-token"),
  };

  return {
    repositories,
    service: new AuthService(
      repositories.users,
      repositories.sessions,
      repositories.emailTokens,
      configService,
      jwtService,
    ),
  };
}

function createUser(overrides: { blockedAt?: Date | null; email: string; passwordHash?: string }) {
  return {
    blockedAt: overrides.blockedAt ?? null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    deletedAt: null,
    email: overrides.email,
    emailVerifiedAt: null,
    firstName: "Ana",
    id: "user-id",
    lastName: "Silva",
    passwordHash: overrides.passwordHash ?? "hash",
    phone: null,
    roles: ["BIOLOGIST"],
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}
