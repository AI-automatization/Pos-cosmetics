import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Zaxirani tekshirish' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({ example: '2026-04-10T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
