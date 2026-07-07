import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { User } from "../users/user.entity.js";

export type AdminAuditAction =
  "BIOLOGIST_VERIFICATION_UPDATED" | "COMPANY_VERIFICATION_UPDATED" | "JOB_STATUS_UPDATED";

export type AdminAuditTargetType = "BIOLOGIST_PROFILE" | "COMPANY" | "JOB";

@Entity({ name: "admin_audit_logs" })
export class AdminAuditLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ name: "actor_user_id", type: "uuid" })
  actorUserId!: string;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "actor_user_id" })
  actor!: User;

  @Column({ type: "varchar", length: 80 })
  action!: AdminAuditAction;

  @Index()
  @Column({ name: "target_type", type: "varchar", length: 80 })
  targetType!: AdminAuditTargetType;

  @Index()
  @Column({ name: "target_id", type: "uuid" })
  targetId!: string;

  @Column({ name: "before_state", type: "jsonb", nullable: true })
  beforeState!: Record<string, unknown> | null;

  @Column({ name: "after_state", type: "jsonb", nullable: true })
  afterState!: Record<string, unknown> | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
