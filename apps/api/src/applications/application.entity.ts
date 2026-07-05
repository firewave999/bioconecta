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

import { BiologistProfile } from "../biologist-profile/biologist-profile.entity.js";
import { Job } from "../jobs/job.entity.js";

export type ApplicationStatus =
  | "APPLIED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

@Entity({ name: "applications" })
@Index(["jobId", "biologistProfileId"], { unique: true })
export class Application {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ name: "job_id", type: "uuid" })
  jobId!: string;

  @ManyToOne(() => Job, { onDelete: "CASCADE" })
  @JoinColumn({ name: "job_id" })
  job!: Job;

  @Index()
  @Column({ name: "biologist_profile_id", type: "uuid" })
  biologistProfileId!: string;

  @ManyToOne(() => BiologistProfile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "biologist_profile_id" })
  biologistProfile!: BiologistProfile;

  @Column({ type: "varchar", length: 24, default: "APPLIED" })
  status!: ApplicationStatus;

  @Column({ name: "match_score", type: "integer", default: 0 })
  matchScore!: number;

  @Column({ name: "match_reasons", type: "text", array: true, default: () => "ARRAY[]::text[]" })
  matchReasons!: string[];

  @Column({ name: "cover_message", type: "text", nullable: true })
  coverMessage!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
