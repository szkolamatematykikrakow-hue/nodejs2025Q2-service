import { IsString, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateArtistDto {
  @ApiProperty({
    description: 'Artist name',
    minLength: 1,
    maxLength: 255,
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    description: 'Whether artist has won Grammy',
    example: true,
    required: false,
  })
  @IsBoolean()
  grammy?: boolean;
}
