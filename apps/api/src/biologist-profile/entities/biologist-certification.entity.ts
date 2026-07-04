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

@Entity({ name: "biologist_certifications" })
export class BiologistCertification {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ name: "profile_id", type: "uuid" })
  profileId!: string;

  @ManyToOne(() => BiologistProfile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "profile_id" })
  profile!: BiologistProfile;

  @Column({ type: "varchar", length: 160 })
  name!: string;

  @Column({ name: "issuer_name", type: "varchar", length: 160, nullable: true })
  issuerName!: string | null;

  @Column({ name: "issued_year", type: "integer", nullable: true })
  issuedYear!: number | null;

  @Column({ name: "credential_url", type: "text", nullable: true })
  credentialUrl!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
