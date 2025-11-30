import { IsString, Matches } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9]{3,30}/)
  newPassword: string;
}
