import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuthTables1760000000000 implements MigrationInterface {
  name = "CreateAuthTables1760000000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "first_name" varchar(80) NOT NULL,
        "last_name" varchar(120) NOT NULL,
        "email" citext NOT NULL,
        "phone" varchar(32),
        "password_hash" varchar(255) NOT NULL,
        "roles" text[] NOT NULL DEFAULT ARRAY[]::text[],
        "email_verified_at" timestamptz,
        "terms_accepted_at" timestamptz NOT NULL,
        "privacy_accepted_at" timestamptz NOT NULL,
        "blocked_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz
      )
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")`);

    await queryRunner.query(`
      CREATE TABLE "sessions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "refresh_token_hash" varchar(255) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "revoked_at" timestamptz,
        "last_used_at" timestamptz,
        "user_agent" text,
        "ip_address" inet,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_sessions_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_sessions_user_id" ON "sessions" ("user_id")`);

    await queryRunner.query(`
      CREATE TABLE "email_verification_tokens" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "token_hash" varchar(255) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "used_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_email_verification_tokens_user_id"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_email_verification_tokens_user_id" ON "email_verification_tokens" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_email_verification_tokens_token_hash" ON "email_verification_tokens" ("token_hash")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_email_verification_tokens_token_hash"`);
    await queryRunner.query(`DROP INDEX "IDX_email_verification_tokens_user_id"`);
    await queryRunner.query(`DROP TABLE "email_verification_tokens"`);
    await queryRunner.query(`DROP INDEX "IDX_sessions_user_id"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
