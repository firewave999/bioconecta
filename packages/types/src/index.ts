export const USER_ROLES = [
  "BIOLOGIST",
  "STUDENT",
  "COMPANY",
  "RECRUITER",
  "ADMIN",
  "MODERATOR",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const VERIFICATION_STATUSES = [
  "UNVERIFIED",
  "PENDING",
  "VERIFIED",
  "REJECTED",
  "SUSPENDED",
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const APPLICATION_STATUSES = [
  "APPLIED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
  "WITHDRAWN",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
