import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfileImageUrls1760900000000 implements MigrationInterface {
  name = "AddProfileImageUrls1760900000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "companies" ADD "logo_url" varchar(500)`);
    await queryRunner.query(`ALTER TABLE "biologist_profiles" ADD "avatar_url" varchar(500)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "biologist_profiles" DROP COLUMN "avatar_url"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "logo_url"`);
  }
}
