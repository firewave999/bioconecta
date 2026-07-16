import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { Transform } from "class-transformer";

export class UpsertJobDto {
  @IsString()
  @MaxLength(180)
  title!: string;

  @IsString()
  @MaxLength(5000)
  description!: string;

  @IsIn(["DRAFT", "PUBLISHED", "CLOSED"])
  status!: "DRAFT" | "PUBLISHED" | "CLOSED";

  @IsIn(["CLT", "PJ", "FREELANCE", "INTERNSHIP", "TEMPORARY"])
  contractType!: "CLT" | "PJ" | "FREELANCE" | "INTERNSHIP" | "TEMPORARY";

  @IsIn(["ON_SITE", "REMOTE", "HYBRID", "FIELD"])
  workMode!: "ON_SITE" | "REMOTE" | "HYBRID" | "FIELD";

  @IsString()
  @Length(2, 2)
  state!: string;

  @IsString()
  @MaxLength(120)
  city!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000000)
  salaryMinCents?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000000)
  salaryMaxCents?: number;

  @IsBoolean()
  requiresCrbio!: boolean;

  @IsBoolean()
  acceptsStudents!: boolean;

  @IsBoolean()
  requiresTravel!: boolean;

  @Transform(({ value }) => splitListValue(value))
  @IsArray()
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  requiredPracticeAreas!: string[];

  @Transform(({ value }) => splitListValue(value))
  @IsArray()
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  requiredTaxonomicGroups!: string[];

  @Transform(({ value }) => splitListValue(value))
  @IsArray()
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  requiredSkills!: string[];
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
