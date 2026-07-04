import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBiologistProfiles1760100000000 implements MigrationInterface {
  name = "CreateBiologistProfiles1760100000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "biologist_profiles" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "full_name" varchar(180) NOT NULL,
        "cpf" varchar(14) NOT NULL,
        "birth_date" date NOT NULL,
        "crbio_number" varchar(32) NOT NULL,
        "crbio_region" varchar(24) NOT NULL,
        "state" varchar(2) NOT NULL,
        "city" varchar(120) NOT NULL,
        "registration_status" varchar(24) NOT NULL DEFAULT 'UNKNOWN',
        "graduation_year" integer NOT NULL,
        "headline" varchar(180),
        "bio" text,
        "availability_status" varchar(32) NOT NULL DEFAULT 'AVAILABLE_NOW',
        "available_from" date,
        "accepts_travel" boolean NOT NULL DEFAULT false,
        "has_driver_license" boolean NOT NULL DEFAULT false,
        "has_own_vehicle" boolean NOT NULL DEFAULT false,
        "has_cnpj" boolean NOT NULL DEFAULT false,
        "issues_invoice" boolean NOT NULL DEFAULT false,
        "verification_status" varchar(24) NOT NULL DEFAULT 'UNVERIFIED',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_biologist_profiles_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_biologist_profiles_user_id" ON "biologist_profiles" ("user_id")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_biologist_profiles_user_id"`);
    await queryRunner.query(`DROP TABLE "biologist_profiles"`);
  }
}
