import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProfessionalProfileTables1760200000000 implements MigrationInterface {
  name = "CreateProfessionalProfileTables1760200000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "practice_areas" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(120) NOT NULL,
        "category" varchar(120),
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_practice_areas_name" ON "practice_areas" ("name")`,
    );

    await queryRunner.query(`
      CREATE TABLE "taxonomic_groups" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(120) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_taxonomic_groups_name" ON "taxonomic_groups" ("name")`,
    );

    await queryRunner.query(`
      CREATE TABLE "skills" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(120) NOT NULL,
        "category" varchar(120),
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_skills_name" ON "skills" ("name")`);

    await queryRunner.query(`
      CREATE TABLE "biologist_profile_practice_areas" (
        "profile_id" uuid NOT NULL,
        "practice_area_id" uuid NOT NULL,
        PRIMARY KEY ("profile_id", "practice_area_id"),
        CONSTRAINT "FK_biologist_profile_practice_areas_profile_id" FOREIGN KEY ("profile_id") REFERENCES "biologist_profiles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_biologist_profile_practice_areas_practice_area_id" FOREIGN KEY ("practice_area_id") REFERENCES "practice_areas"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "biologist_profile_taxonomic_groups" (
        "profile_id" uuid NOT NULL,
        "taxonomic_group_id" uuid NOT NULL,
        PRIMARY KEY ("profile_id", "taxonomic_group_id"),
        CONSTRAINT "FK_biologist_profile_taxonomic_groups_profile_id" FOREIGN KEY ("profile_id") REFERENCES "biologist_profiles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_biologist_profile_taxonomic_groups_taxonomic_group_id" FOREIGN KEY ("taxonomic_group_id") REFERENCES "taxonomic_groups"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "biologist_profile_skills" (
        "profile_id" uuid NOT NULL,
        "skill_id" uuid NOT NULL,
        PRIMARY KEY ("profile_id", "skill_id"),
        CONSTRAINT "FK_biologist_profile_skills_profile_id" FOREIGN KEY ("profile_id") REFERENCES "biologist_profiles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_biologist_profile_skills_skill_id" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "biologist_experiences" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "profile_id" uuid NOT NULL,
        "title" varchar(160) NOT NULL,
        "organization_name" varchar(160),
        "start_year" integer NOT NULL,
        "end_year" integer,
        "is_current" boolean NOT NULL DEFAULT false,
        "description" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_biologist_experiences_profile_id" FOREIGN KEY ("profile_id") REFERENCES "biologist_profiles"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_biologist_experiences_profile_id" ON "biologist_experiences" ("profile_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "biologist_certifications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "profile_id" uuid NOT NULL,
        "name" varchar(160) NOT NULL,
        "issuer_name" varchar(160),
        "issued_year" integer,
        "credential_url" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_biologist_certifications_profile_id" FOREIGN KEY ("profile_id") REFERENCES "biologist_profiles"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_biologist_certifications_profile_id" ON "biologist_certifications" ("profile_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "biologist_documents" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "profile_id" uuid NOT NULL,
        "type" varchar(24) NOT NULL,
        "title" varchar(160) NOT NULL,
        "file_url" text NOT NULL,
        "verification_status" varchar(24) NOT NULL DEFAULT 'PENDING',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_biologist_documents_profile_id" FOREIGN KEY ("profile_id") REFERENCES "biologist_profiles"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_biologist_documents_profile_id" ON "biologist_documents" ("profile_id")`,
    );

    await queryRunner.query(`
      INSERT INTO "practice_areas" ("name", "category") VALUES
        ('Licenciamento ambiental', 'Consultoria'),
        ('Inventario de fauna', 'Campo'),
        ('Inventario de flora', 'Campo'),
        ('Resgate de fauna', 'Campo'),
        ('Monitoramento ambiental', 'Campo'),
        ('Educacao ambiental', 'Socioambiental'),
        ('Geoprocessamento', 'Analise'),
        ('Analise de dados ecologicos', 'Analise')
    `);

    await queryRunner.query(`
      INSERT INTO "taxonomic_groups" ("name") VALUES
        ('Aves'),
        ('Mamiferos'),
        ('Herpetofauna'),
        ('Ictiofauna'),
        ('Invertebrados'),
        ('Flora'),
        ('Fitoplancton'),
        ('Zooplancton')
    `);

    await queryRunner.query(`
      INSERT INTO "skills" ("name", "category") VALUES
        ('Identificacao taxonomica', 'Tecnica'),
        ('Coleta de campo', 'Campo'),
        ('Armadilhas fotograficas', 'Campo'),
        ('Bioacustica', 'Campo'),
        ('QGIS', 'Ferramenta'),
        ('R', 'Ferramenta'),
        ('Relatorios tecnicos', 'Documentacao'),
        ('Coordenacao de equipe', 'Gestao')
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_biologist_documents_profile_id"`);
    await queryRunner.query(`DROP TABLE "biologist_documents"`);
    await queryRunner.query(`DROP INDEX "IDX_biologist_certifications_profile_id"`);
    await queryRunner.query(`DROP TABLE "biologist_certifications"`);
    await queryRunner.query(`DROP INDEX "IDX_biologist_experiences_profile_id"`);
    await queryRunner.query(`DROP TABLE "biologist_experiences"`);
    await queryRunner.query(`DROP TABLE "biologist_profile_skills"`);
    await queryRunner.query(`DROP TABLE "biologist_profile_taxonomic_groups"`);
    await queryRunner.query(`DROP TABLE "biologist_profile_practice_areas"`);
    await queryRunner.query(`DROP INDEX "IDX_skills_name"`);
    await queryRunner.query(`DROP TABLE "skills"`);
    await queryRunner.query(`DROP INDEX "IDX_taxonomic_groups_name"`);
    await queryRunner.query(`DROP TABLE "taxonomic_groups"`);
    await queryRunner.query(`DROP INDEX "IDX_practice_areas_name"`);
    await queryRunner.query(`DROP TABLE "practice_areas"`);
  }
}
