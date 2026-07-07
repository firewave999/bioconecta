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

import { User } from "../users/user.entity.js";

export type CompanySize = "SOLO" | "SMALL" | "MEDIUM" | "LARGE";
export type CompanyVerificationStatus = "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";

@Entity({ name: "companies" })
export class Company {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ name: "owner_user_id", type: "uuid" })
  ownerUserId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "owner_user_id" })
  owner!: User;

  @Column({ type: "varchar", length: 180 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 18 })
  cnpj!: string;

  @Column({ type: "varchar", length: 160, nullable: true })
  website!: string | null;

  @Column({ type: "varchar", length: 2 })
  state!: string;

  @Column({ type: "varchar", length: 120 })
  city!: string;

  @Column({ type: "varchar", length: 24, default: "SMALL" })
  size!: CompanySize;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ name: "verification_status", type: "varchar", length: 24, default: "UNVERIFIED" })
  verificationStatus!: CompanyVerificationStatus;

  @Column({ name: "verification_notes", type: "text", nullable: true })
  verificationNotes!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
