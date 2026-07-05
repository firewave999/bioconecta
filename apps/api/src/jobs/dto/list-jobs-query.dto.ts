import { IsOptional, IsString, MaxLength } from "class-validator";

export class ListJobsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(24)
  workMode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(24)
  contractType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  requirement?: string;
}
