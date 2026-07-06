import { IsIn } from "class-validator";

import type { CompanyVerificationStatus } from "../../companies/company.entity.js";

export class UpdateCompanyVerificationStatusDto {
  @IsIn(["UNVERIFIED", "PENDING", "VERIFIED", "REJECTED"])
  verificationStatus!: CompanyVerificationStatus;
}
