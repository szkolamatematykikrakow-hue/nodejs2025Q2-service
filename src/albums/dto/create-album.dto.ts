import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlbumDto {
  @ApiProperty({
    description: 'Album name',
    minLength: 1,
    maxLength: 255,
    example: 'Innuendo',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Release year',
    minimum: 1900,
    maximum: new Date().getFullYear(),
    example: 1991,
  })
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  year: number;

  @ApiProperty({
    description: 'Artist ID',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  artistId?: string;
}
