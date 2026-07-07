import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompanyVerificationNotes1760800000000 implements MigrationInterface {
  name = "AddCompanyVerificationNotes1760800000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "companies" ADD "verification_notes" text`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "verification_notes"`);
  }
}
