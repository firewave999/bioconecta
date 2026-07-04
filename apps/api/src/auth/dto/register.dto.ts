import type { UserRole } from "@bioconecta/types";
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
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
}
