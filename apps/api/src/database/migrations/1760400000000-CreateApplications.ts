import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateApplications1760400000000 implements MigrationInterface {
  name = "CreateApplications1760400000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "applications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "job_id" uuid NOT NULL,
        "biologist_profile_id" uuid NOT NULL,
        "status" varchar(24) NOT NULL DEFAULT 'APPLIED',
        "match_score" integer NOT NULL DEFAULT 0,
        "match_reasons" text[] NOT NULL DEFAULT ARRAY[]::text[],
        "cover_message" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_applications_job_id" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_applications_biologist_profile_id" FOREIGN KEY ("biologist_profile_id") REFERENCES "biologist_profiles"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_applications_job_id" ON "applications" ("job_id")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_applications_biologist_profile_id" ON "applications" ("biologist_profile_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_applications_job_profile" ON "applications" ("job_id", "biologist_profile_id")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_applications_job_profile"`);
    await queryRunner.query(`DROP INDEX "IDX_applications_biologist_profile_id"`);
    await queryRunner.query(`DROP INDEX "IDX_applications_job_id"`);
    await queryRunner.query(`DROP TABLE "applications"`);
  }
}
