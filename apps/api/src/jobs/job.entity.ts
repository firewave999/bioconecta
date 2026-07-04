import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Company } from "../companies/company.entity.js";

export type JobStatus = "DRAFT" | "PUBLISHED" | "CLOSED";
export type JobWorkMode = "ON_SITE" | "REMOTE" | "HYBRID" | "FIELD";
export type JobContractType = "CLT" | "PJ" | "FREELANCE" | "INTERNSHIP" | "TEMPORARY";

@Entity({ name: "jobs" })
export class Job {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ name: "company_id", type: "uuid" })
  companyId!: string;

  @ManyToOne(() => Company, { onDelete: "CASCADE" })
  @JoinColumn({ name: "company_id" })
  company!: Company;

  @Column({ type: "varchar", length: 180 })
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "varchar", length: 24, default: "DRAFT" })
  status!: JobStatus;

  @Column({ name: "contract_type", type: "varchar", length: 24 })
  contractType!: JobContractType;

  @Column({ name: "work_mode", type: "varchar", length: 24 })
  workMode!: JobWorkMode;

  @Column({ type: "varchar", length: 2 })
  state!: string;

  @Column({ type: "varchar", length: 120 })
  city!: string;

  @Column({ name: "salary_min_cents", type: "integer", nullable: true })
  salaryMinCents!: number | null;

  @Column({ name: "salary_max_cents", type: "integer", nullable: true })
  salaryMaxCents!: number | null;

  @Column({ name: "requires_crbio", type: "boolean", default: true })
  requiresCrbio!: boolean;

  @Column({ name: "accepts_students", type: "boolean", default: false })
  acceptsStudents!: boolean;

  @Column({ name: "requires_travel", type: "boolean", default: false })
  requiresTravel!: boolean;

  @Column({
    name: "required_practice_areas",
    type: "text",
    array: true,
    default: () => "ARRAY[]::text[]",
  })
  requiredPracticeAreas!: string[];

  @Column({
    name: "required_taxonomic_groups",
    type: "text",
    array: true,
    default: () => "ARRAY[]::text[]",
  })
  requiredTaxonomicGroups!: string[];

  @Column({ name: "required_skills", type: "text", array: true, default: () => "ARRAY[]::text[]" })
  requiredSkills!: string[];

  @Column({ name: "published_at", type: "timestamptz", nullable: true })
  publishedAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
