import type { UserRole } from "@bioconecta/types";
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";

export class RegisterDto {
  @IsString()
  @MaxLength(80)
  firstName!: string;

  @IsString()
  @MaxLength(120)
  lastName!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsIn(["BIOLOGIST", "STUDENT", "COMPANY"])
  role!: UserRole;

  @IsBoolean()
  acceptTerms!: boolean;

  @IsBoolean()
  acceptPrivacy!: boolean;

  @ValidateIf((dto: RegisterDto) => dto.role === "COMPANY")
  @IsString()
  @MaxLength(180)
  companyName?: string;

  @ValidateIf((dto: RegisterDto) => dto.role === "COMPANY")
  @IsString()
  @Length(14, 18)
  companyCnpj?: string;

  @ValidateIf((dto: RegisterDto) => dto.role === "COMPANY")
  @IsString()
  @Length(2, 2)
  companyState?: string;

  @ValidateIf((dto: RegisterDto) => dto.role === "COMPANY")
  @IsString()
  @MaxLength(120)
  companyCity?: string;

  @ValidateIf((dto: RegisterDto) => dto.role === "COMPANY")
  @IsIn(["SOLO", "SMALL", "MEDIUM", "LARGE"])
  companySize?: "SOLO" | "SMALL" | "MEDIUM" | "LARGE";
}
