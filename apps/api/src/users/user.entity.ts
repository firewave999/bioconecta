import { UserRole } from "@bioconecta/types";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "first_name", type: "varchar", length: 80 })
  firstName!: string;

  @Column({ name: "last_name", type: "varchar", length: 120 })
  lastName!: string;

  @Index({ unique: true })
  @Column({ type: "citext" })
  email!: string;

  @Column({ name: "phone", type: "varchar", length: 32, nullable: true })
  phone!: string | null;

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash!: string;

  @Column({ type: "text", array: true, default: () => "ARRAY[]::text[]" })
  roles!: UserRole[];

  @Column({ name: "email_verified_at", type: "timestamptz", nullable: true })
  emailVerifiedAt!: Date | null;

  @Column({ name: "terms_accepted_at", type: "timestamptz" })
  termsAcceptedAt!: Date;

  @Column({ name: "privacy_accepted_at", type: "timestamptz" })
  privacyAcceptedAt!: Date;

  @Column({ name: "blocked_at", type: "timestamptz", nullable: true })
  blockedAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "timestamptz", nullable: true })
  deletedAt!: Date | null;
}
