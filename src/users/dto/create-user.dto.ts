import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  login: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9]{3,30}/)
  password: string;
}
