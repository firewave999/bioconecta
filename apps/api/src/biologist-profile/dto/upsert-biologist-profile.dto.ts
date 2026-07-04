import {
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class UpsertBiologistProfileDto {
  @IsString()
  @MaxLength(180)
  fullName!: string;

  @IsString()
  @Length(11, 14)
  cpf!: string;

  @IsISO8601({ strict: true })
  birthDate!: string;

  @IsString()
  @MaxLength(32)
  crbioNumber!: string;

  @IsString()
  @MaxLength(24)
  crbioRegion!: string;

  @IsString()
  @Length(2, 2)
  state!: string;

  @IsString()
  @MaxLength(120)
  city!: string;

  @IsIn(["ACTIVE", "INACTIVE", "PENDING", "UNKNOWN"])
  registrationStatus!: "ACTIVE" | "INACTIVE" | "PENDING" | "UNKNOWN";

  @IsInt()
  @Min(1950)
  @Max(2100)
  graduationYear!: number;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  headline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsIn(["AVAILABLE_NOW", "AVAILABLE_FROM_DATE", "UNAVAILABLE"])
  availabilityStatus!: "AVAILABLE_NOW" | "AVAILABLE_FROM_DATE" | "UNAVAILABLE";

  @IsOptional()
  @IsISO8601({ strict: true })
  availableFrom?: string;

  @IsBoolean()
  acceptsTravel!: boolean;

  @IsBoolean()
  hasDriverLicense!: boolean;

  @IsBoolean()
  hasOwnVehicle!: boolean;

  @IsBoolean()
  hasCnpj!: boolean;

  @IsBoolean()
  issuesInvoice!: boolean;
}
