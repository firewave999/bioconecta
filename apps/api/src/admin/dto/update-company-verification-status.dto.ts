import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

import type { CompanyVerificationStatus } from "../../companies/company.entity.js";

export class UpdateCompanyVerificationStatusDto {
  @IsIn(["UNVERIFIED", "PENDING", "VERIFIED", "REJECTED"])
  verificationStatus!: CompanyVerificationStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  verificationNotes?: string;
}
