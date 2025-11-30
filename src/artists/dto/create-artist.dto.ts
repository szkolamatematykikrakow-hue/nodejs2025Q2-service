import { IsString, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArtistDto {
  @ApiProperty({
    description: 'Artist name',
    minLength: 1,
    maxLength: 255,
    example: 'John Doe',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Whether artist has won Grammy',
    example: true,
  })
  @IsBoolean()
  grammy: boolean;
}
