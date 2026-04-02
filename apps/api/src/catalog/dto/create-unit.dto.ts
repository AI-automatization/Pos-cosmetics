import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({ example: 'Kilogram' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: 'kg' })
  @IsString()
  @MinLength(1)
  shortName!: string;
}
