import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { Transform, Type } from "class-transformer";

class ExperienceDto {
  @IsString()
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  organizationName?: string;

  @IsInt()
  @Min(1950)
  @Max(2100)
  startYear!: number;

  @IsOptional()
  @IsInt()
  @Min(1950)
  @Max(2100)
  endYear?: number;

  @IsBoolean()
  isCurrent!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}

class CertificationDto {
  @IsString()
  @MaxLength(160)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  issuerName?: string;

  @IsOptional()
  @IsInt()
  @Min(1950)
  @Max(2100)
  issuedYear?: number;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  credentialUrl?: string;
}

class DocumentDto {
  @IsIn(["CRBIO", "DIPLOMA", "CERTIFICATE", "PORTFOLIO", "OTHER"])
  type!: "CRBIO" | "DIPLOMA" | "CERTIFICATE" | "PORTFOLIO" | "OTHER";

  @IsString()
  @MaxLength(160)
  title!: string;

  @IsUrl({ require_protocol: true })
  fileUrl!: string;
}

export class UpsertProfessionalProfileDto {
  @Transform(({ value }) => splitListValue(value))
  @IsArray()
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  practiceAreas!: string[];

  @Transform(({ value }) => splitListValue(value))
  @IsArray()
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  taxonomicGroups!: string[];

  @Transform(({ value }) => splitListValue(value))
  @IsArray()
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  skills!: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experiences!: ExperienceDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificationDto)
  certifications!: CertificationDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents!: DocumentDto[];
}

function splitListValue(value: unknown) {
  const values = Array.isArray(value) ? value : [value];

  return [
    ...new Set(
      values
        .filter((item): item is string => typeof item === "string")
        .flatMap((item) => item.split(/[,;\n]+/))
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}
