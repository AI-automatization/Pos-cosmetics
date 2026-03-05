import { IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddBundleComponentDto {
  @ApiProperty({ description: 'Komponent mahsulot ID' })
  @IsString()
  componentId!: string;

  @ApiProperty({ example: 1, description: 'Bundleda bu komponentdan nechta kerak' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  quantity!: number;
}
