import { IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
  @MinLength(8)
  password!: string;

  @IsString()
  token!: string;
}
