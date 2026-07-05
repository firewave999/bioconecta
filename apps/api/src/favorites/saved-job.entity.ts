import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
} from "typeorm";

import { Job } from "../jobs/job.entity.js";
import { User } from "../users/user.entity.js";

@Entity({ name: "saved_jobs" })
@Index(["userId", "jobId"], { unique: true })
export class SavedJob {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Index()
  @Column({ name: "job_id", type: "uuid" })
  jobId!: string;

  @ManyToOne(() => Job, { onDelete: "CASCADE" })
  @JoinColumn({ name: "job_id" })
  job!: Job;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
