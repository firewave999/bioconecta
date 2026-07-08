import { User } from "../users/user.entity.js";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export type CrbioRegistrationStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "UNKNOWN";
export type ProfileAvailabilityStatus = "AVAILABLE_NOW" | "AVAILABLE_FROM_DATE" | "UNAVAILABLE";
export type VerificationStatus = "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED";

@Entity({ name: "biologist_profiles" })
export class BiologistProfile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @OneToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "full_name", type: "varchar", length: 180 })
  fullName!: string;

  @Column({ type: "varchar", length: 14 })
  cpf!: string;

  @Column({ name: "birth_date", type: "date" })
  birthDate!: string;

  @Column({ name: "crbio_number", type: "varchar", length: 32 })
  crbioNumber!: string;

  @Column({ name: "crbio_region", type: "varchar", length: 24 })
  crbioRegion!: string;

  @Column({ type: "varchar", length: 2 })
  state!: string;

  @Column({ type: "varchar", length: 120 })
  city!: string;

  @Column({ name: "registration_status", type: "varchar", length: 24, default: "UNKNOWN" })
  registrationStatus!: CrbioRegistrationStatus;

  @Column({ name: "graduation_year", type: "integer" })
  graduationYear!: number;

  @Column({ type: "varchar", length: 180, nullable: true })
  headline!: string | null;

  @Column({ name: "avatar_url", type: "varchar", length: 500, nullable: true })
  avatarUrl!: string | null;

  @Column({ type: "text", nullable: true })
  bio!: string | null;

  @Column({ name: "availability_status", type: "varchar", length: 32, default: "AVAILABLE_NOW" })
  availabilityStatus!: ProfileAvailabilityStatus;

  @Column({ name: "available_from", type: "date", nullable: true })
  availableFrom!: string | null;

  @Column({ name: "accepts_travel", type: "boolean", default: false })
  acceptsTravel!: boolean;

  @Column({ name: "has_driver_license", type: "boolean", default: false })
  hasDriverLicense!: boolean;

  @Column({ name: "has_own_vehicle", type: "boolean", default: false })
  hasOwnVehicle!: boolean;

  @Column({ name: "has_cnpj", type: "boolean", default: false })
  hasCnpj!: boolean;

  @Column({ name: "issues_invoice", type: "boolean", default: false })
  issuesInvoice!: boolean;

  @Column({ name: "verification_status", type: "varchar", length: 24, default: "UNVERIFIED" })
  verificationStatus!: VerificationStatus;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
