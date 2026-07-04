import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCompaniesAndJobs1760300000000 implements MigrationInterface {
  name = "CreateCompaniesAndJobs1760300000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "companies" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "owner_user_id" uuid NOT NULL,
        "name" varchar(180) NOT NULL,
        "cnpj" varchar(18) NOT NULL,
        "website" varchar(160),
        "state" varchar(2) NOT NULL,
        "city" varchar(120) NOT NULL,
        "size" varchar(24) NOT NULL DEFAULT 'SMALL',
        "description" text,
        "verification_status" varchar(24) NOT NULL DEFAULT 'UNVERIFIED',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_companies_owner_user_id" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_companies_owner_user_id" ON "companies" ("owner_user_id")`,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_companies_cnpj" ON "companies" ("cnpj")`);

    await queryRunner.query(`
      CREATE TABLE "jobs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "company_id" uuid NOT NULL,
        "title" varchar(180) NOT NULL,
        "description" text NOT NULL,
        "status" varchar(24) NOT NULL DEFAULT 'DRAFT',
        "contract_type" varchar(24) NOT NULL,
        "work_mode" varchar(24) NOT NULL,
        "state" varchar(2) NOT NULL,
        "city" varchar(120) NOT NULL,
        "salary_min_cents" integer,
        "salary_max_cents" integer,
        "requires_crbio" boolean NOT NULL DEFAULT true,
        "accepts_students" boolean NOT NULL DEFAULT false,
        "requires_travel" boolean NOT NULL DEFAULT false,
        "required_practice_areas" text[] NOT NULL DEFAULT ARRAY[]::text[],
        "required_taxonomic_groups" text[] NOT NULL DEFAULT ARRAY[]::text[],
        "required_skills" text[] NOT NULL DEFAULT ARRAY[]::text[],
        "published_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_jobs_company_id" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_jobs_company_id" ON "jobs" ("company_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_jobs_status" ON "jobs" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_jobs_location" ON "jobs" ("state", "city")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_jobs_location"`);
    await queryRunner.query(`DROP INDEX "IDX_jobs_status"`);
    await queryRunner.query(`DROP INDEX "IDX_jobs_company_id"`);
    await queryRunner.query(`DROP TABLE "jobs"`);
    await queryRunner.query(`DROP INDEX "IDX_companies_cnpj"`);
    await queryRunner.query(`DROP INDEX "IDX_companies_owner_user_id"`);
    await queryRunner.query(`DROP TABLE "companies"`);
  }
}
