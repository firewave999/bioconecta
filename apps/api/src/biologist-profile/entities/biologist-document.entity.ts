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

import { BiologistProfile } from "../biologist-profile.entity.js";

export type BiologistDocumentType = "CRBIO" | "DIPLOMA" | "CERTIFICATE" | "PORTFOLIO" | "OTHER";

@Entity({ name: "biologist_documents" })
export class BiologistDocument {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ name: "profile_id", type: "uuid" })
  profileId!: string;

  @ManyToOne(() => BiologistProfile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "profile_id" })
  profile!: BiologistProfile;

  @Column({ type: "varchar", length: 24 })
  type!: BiologistDocumentType;

  @Column({ type: "varchar", length: 160 })
  title!: string;

  @Column({ name: "file_url", type: "text" })
  fileUrl!: string;

  @Column({ name: "verification_status", type: "varchar", length: 24, default: "PENDING" })
  verificationStatus!: "PENDING" | "APPROVED" | "REJECTED";

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
