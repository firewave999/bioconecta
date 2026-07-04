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

@Entity({ name: "biologist_experiences" })
export class BiologistExperience {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ name: "profile_id", type: "uuid" })
  profileId!: string;

  @ManyToOne(() => BiologistProfile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "profile_id" })
  profile!: BiologistProfile;

  @Column({ type: "varchar", length: 160 })
  title!: string;

  @Column({ name: "organization_name", type: "varchar", length: 160, nullable: true })
  organizationName!: string | null;

  @Column({ name: "start_year", type: "integer" })
  startYear!: number;

  @Column({ name: "end_year", type: "integer", nullable: true })
  endYear!: number | null;

  @Column({ name: "is_current", type: "boolean", default: false })
  isCurrent!: boolean;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
