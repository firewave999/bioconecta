import { IsIn } from "class-validator";

export class UpdateApplicationStatusDto {
  @IsIn([
    "APPLIED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "INTERVIEW",
    "OFFER",
    "HIRED",
    "REJECTED",
    "WITHDRAWN",
  ])
  status!:
    | "APPLIED"
    | "UNDER_REVIEW"
    | "SHORTLISTED"
    | "INTERVIEW"
    | "OFFER"
    | "HIRED"
    | "REJECTED"
    | "WITHDRAWN";
}
