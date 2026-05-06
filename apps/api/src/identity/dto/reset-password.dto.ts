import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'NewP@ssword1' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  newPassword!: string;
}
