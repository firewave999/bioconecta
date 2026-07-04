import { IsIn, IsOptional, IsString, IsUrl, Length, MaxLength } from "class-validator";

export class UpsertCompanyDto {
  @IsString()
  @MaxLength(180)
  name!: string;

  @IsString()
  @Length(14, 18)
  cnpj!: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  website?: string;

  @IsString()
  @Length(2, 2)
  state!: string;

  @IsString()
  @MaxLength(120)
  city!: string;

  @IsIn(["SOLO", "SMALL", "MEDIUM", "LARGE"])
  size!: "SOLO" | "SMALL" | "MEDIUM" | "LARGE";

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
