import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSavedJobs1760500000000 implements MigrationInterface {
  name = "CreateSavedJobs1760500000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "saved_jobs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "job_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_saved_jobs_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_saved_jobs_job_id" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_saved_jobs_user_id" ON "saved_jobs" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_saved_jobs_job_id" ON "saved_jobs" ("job_id")`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_saved_jobs_user_job" ON "saved_jobs" ("user_id", "job_id")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_saved_jobs_user_job"`);
    await queryRunner.query(`DROP INDEX "IDX_saved_jobs_job_id"`);
    await queryRunner.query(`DROP INDEX "IDX_saved_jobs_user_id"`);
    await queryRunner.query(`DROP TABLE "saved_jobs"`);
  }
}
