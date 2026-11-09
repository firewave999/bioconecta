import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

const TRUE_FLAG = ["true"] as const;

export class SearchBiologistsQueryDto {
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
  @MaxLength(120)
  practiceArea?: string;

  @IsOptional()
  @IsIn(TRUE_FLAG)
  verifiedOnly?: string;

  @IsOptional()
  @IsIn(TRUE_FLAG)
  availableNow?: string;

  @IsOptional()
  @IsIn(TRUE_FLAG)
  acceptsTravel?: string;

  @IsOptional()
  @IsIn(TRUE_FLAG)
  hasDriverLicense?: string;

  @IsOptional()
  @IsIn(TRUE_FLAG)
  hasOwnVehicle?: string;

  @IsOptional()
  @IsIn(TRUE_FLAG)
  hasCnpj?: string;

  @IsOptional()
  @IsIn(TRUE_FLAG)
  issuesInvoice?: string;
}
