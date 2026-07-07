import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAdminAuditLogs1760600000000 implements MigrationInterface {
  name = "CreateAdminAuditLogs1760600000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "admin_audit_logs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "actor_user_id" uuid NOT NULL,
        "action" varchar(80) NOT NULL,
        "target_type" varchar(80) NOT NULL,
        "target_id" uuid NOT NULL,
        "before_state" jsonb,
        "after_state" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_admin_audit_logs_actor_user_id" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_admin_audit_logs_actor_user_id" ON "admin_audit_logs" ("actor_user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_admin_audit_logs_target_type" ON "admin_audit_logs" ("target_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_admin_audit_logs_target_id" ON "admin_audit_logs" ("target_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_admin_audit_logs_created_at" ON "admin_audit_logs" ("created_at")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_admin_audit_logs_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_admin_audit_logs_target_id"`);
    await queryRunner.query(`DROP INDEX "IDX_admin_audit_logs_target_type"`);
    await queryRunner.query(`DROP INDEX "IDX_admin_audit_logs_actor_user_id"`);
    await queryRunner.query(`DROP TABLE "admin_audit_logs"`);
  }
}
