import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

import type { VerificationStatus } from "../../biologist-profile/biologist-profile.entity.js";

export class UpdateBiologistVerificationStatusDto {
  @IsIn(["UNVERIFIED", "PENDING", "VERIFIED", "REJECTED", "SUSPENDED"])
  verificationStatus!: VerificationStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  verificationNotes?: string;
}
