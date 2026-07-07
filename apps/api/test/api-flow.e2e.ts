import "reflect-metadata";

import { ValidationPipe, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("BioConecta API E2E", () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    configureTestEnv();
    assertE2eDatabase();

    const { AppModule } = await import("../src/app.module.js");
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    );

    await app.init();

    dataSource = app.get(DataSource);
    await dataSource.dropDatabase();
    await dataSource.runMigrations();
  });

  afterAll(async () => {
    await app?.close();
  });

  it("runs the biologist, company, job and application flow", async () => {
    const suffix = Date.now();
    const biologist = await registerAndLogin({
      email: `bio.e2e.${suffix}@bioconecta.local`,
      role: "BIOLOGIST",
    });
    const company = await registerAndLogin({
      email: `empresa.e2e.${suffix}@bioconecta.local`,
      role: "COMPANY",
    });

    await request(app.getHttpServer())
      .put("/api/v1/biologist-profile/me")
      .set("Authorization", `Bearer ${biologist.accessToken}`)
      .send({
        acceptsTravel: true,
        availabilityStatus: "AVAILABLE_NOW",
        bio: "Atuacao em monitoramento de fauna.",
        birthDate: "1990-01-01",
        city: "Sao Paulo",
        cpf: "12345678901",
        crbioNumber: "123456/01-D",
        crbioRegion: "01",
        fullName: "Ana E2E",
        graduationYear: 2015,
        hasCnpj: false,
        hasDriverLicense: true,
        hasOwnVehicle: true,
        headline: "Biologa de fauna",
        issuesInvoice: false,
        registrationStatus: "ACTIVE",
        state: "SP",
      })
      .expect(200);

    await request(app.getHttpServer())
      .put("/api/v1/biologist-profile/me/professional")
      .set("Authorization", `Bearer ${biologist.accessToken}`)
      .send({
        certifications: [],
        documents: [],
        experiences: [
          {
            description: "Monitoramento em campo.",
            isCurrent: true,
            organizationName: "Bio Projetos",
            startYear: 2020,
            title: "Biologa de campo",
          },
        ],
        practiceAreas: ["Fauna"],
        skills: ["Geoprocessamento"],
        taxonomicGroups: ["Aves"],
      })
      .expect(200);

    const companyProfileResponse = await request(app.getHttpServer())
      .put("/api/v1/companies/me")
      .set("Authorization", `Bearer ${company.accessToken}`)
      .send({
        city: "Sao Paulo",
        cnpj: `${suffix}`.slice(-14).padStart(14, "9"),
        description: "Consultoria ambiental E2E.",
        name: "Eco E2E",
        size: "SMALL",
        state: "SP",
        website: "https://example.com",
      })
      .expect(200);

    await dataSource.query(
      `UPDATE "users" SET "roles" = array_append("roles", 'ADMIN') WHERE "email" = $1 AND NOT ('ADMIN' = ANY("roles"))`,
      [company.email],
    );
    const admin = await login({
      email: company.email,
      password: "SenhaTeste123",
    });

    await request(app.getHttpServer())
      .put(`/api/v1/admin/companies/${companyProfileResponse.body.company.id}/verification`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ verificationStatus: "VERIFIED" })
      .expect(200);

    await request(app.getHttpServer())
      .get("/api/v1/admin/audit-logs")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveLength(1);
        expect(response.body[0].action).toBe("COMPANY_VERIFICATION_UPDATED");
        expect(response.body[0].actor.email).toBe(company.email);
      });

    const jobResponse = await request(app.getHttpServer())
      .post("/api/v1/jobs")
      .set("Authorization", `Bearer ${company.accessToken}`)
      .send({
        acceptsStudents: false,
        city: "Sao Paulo",
        contractType: "PJ",
        description: "Monitoramento de avifauna.",
        requiredPracticeAreas: ["Fauna"],
        requiredSkills: ["Geoprocessamento"],
        requiredTaxonomicGroups: ["Aves"],
        requiresCrbio: true,
        requiresTravel: true,
        salaryMaxCents: 900000,
        salaryMinCents: 500000,
        state: "SP",
        status: "PUBLISHED",
        title: "Biologo de aves",
        workMode: "FIELD",
      })
      .expect(201);

    const jobId = jobResponse.body.job.id as string;

    await request(app.getHttpServer())
      .get("/api/v1/jobs")
      .query({ q: "aves", state: "SP" })
      .expect(200)
      .expect((response) => {
        expect(response.body.jobs).toHaveLength(1);
        expect(response.body.jobs[0].id).toBe(jobId);
      });

    await request(app.getHttpServer())
      .post(`/api/v1/favorites/jobs/${jobId}`)
      .set("Authorization", `Bearer ${biologist.accessToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/applications/jobs/${jobId}`)
      .set("Authorization", `Bearer ${biologist.accessToken}`)
      .send({ coverMessage: "Tenho experiencia com avifauna." })
      .expect(201)
      .expect((response) => {
        expect(response.body.application.status).toBe("APPLIED");
        expect(response.body.match.score).toBe(100);
      });

    await request(app.getHttpServer())
      .get("/api/v1/notifications/mine")
      .set("Authorization", `Bearer ${company.accessToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.unreadCount).toBe(1);
        expect(response.body.notifications[0].type).toBe("APPLICATION_CREATED");
      });

    await request(app.getHttpServer())
      .get(`/api/v1/applications/jobs/${jobId}/candidates`)
      .set("Authorization", `Bearer ${company.accessToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.applications).toHaveLength(1);
        expect(response.body.applications[0].matchScore).toBe(100);
      });

    const candidatesResponse = await request(app.getHttpServer())
      .get(`/api/v1/applications/jobs/${jobId}/candidates`)
      .set("Authorization", `Bearer ${company.accessToken}`)
      .expect(200);

    const applicationId = candidatesResponse.body.applications[0].id as string;

    await request(app.getHttpServer())
      .put(`/api/v1/applications/${applicationId}/status`)
      .set("Authorization", `Bearer ${company.accessToken}`)
      .send({ status: "INTERVIEW" })
      .expect(200);

    const biologistNotificationsResponse = await request(app.getHttpServer())
      .get("/api/v1/notifications/mine")
      .set("Authorization", `Bearer ${biologist.accessToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.unreadCount).toBe(1);
        expect(response.body.notifications[0].type).toBe("APPLICATION_STATUS_UPDATED");
      });

    await request(app.getHttpServer())
      .put(`/api/v1/notifications/${biologistNotificationsResponse.body.notifications[0].id}/read`)
      .set("Authorization", `Bearer ${biologist.accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get("/api/v1/notifications/mine")
      .set("Authorization", `Bearer ${biologist.accessToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.unreadCount).toBe(0);
      });
  });

  async function registerAndLogin(input: { email: string; role: "BIOLOGIST" | "COMPANY" }) {
    await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({
        acceptPrivacy: true,
        acceptTerms: true,
        email: input.email,
        firstName: input.role === "BIOLOGIST" ? "Ana" : "Carlos",
        lastName: "E2E",
        password: "SenhaTeste123",
        role: input.role,
      })
      .expect(201);

    const loginResponse = await login({ email: input.email, password: "SenhaTeste123" });

    return {
      accessToken: loginResponse.accessToken,
      email: input.email,
    };
  }

  async function login(input: { email: string; password: string }) {
    const loginResponse = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send(input)
      .expect(200);

    return {
      accessToken: loginResponse.body.tokens.accessToken as string,
    };
  }
});

function configureTestEnv() {
  process.env.NODE_ENV = "test";
  process.env.APP_WEB_URL ??= "http://localhost:3000";
  process.env.APP_API_URL ??= "http://localhost:4000";
  process.env.APP_API_PORT ??= "4000";
  process.env.JWT_ACCESS_SECRET ??= "e2e-access-secret-change-me";
  process.env.JWT_REFRESH_SECRET ??= "e2e-refresh-secret-change-me";
  process.env.JWT_ACCESS_TOKEN_TTL_SECONDS ??= "900";
  process.env.JWT_REFRESH_TOKEN_TTL_DAYS ??= "30";
  process.env.EMAIL_VERIFICATION_TOKEN_TTL_HOURS ??= "24";
  process.env.REDIS_URL ??= "redis://localhost:6379";
}

function assertE2eDatabase() {
  const databaseName = process.env.DATABASE_URL
    ? new URL(process.env.DATABASE_URL).pathname.replace("/", "")
    : process.env.POSTGRES_DB;

  if (!databaseName?.includes("e2e")) {
    throw new Error(
      `E2E tests require a dedicated database containing "e2e" in its name. Current database: ${databaseName ?? "not configured"}.`,
    );
  }
}
