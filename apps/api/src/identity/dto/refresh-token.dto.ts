import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty()
  @IsUUID()
  userId!: string;

  /**
   * @deprecated httpOnly cookie ishlatiladi. Mobile backward compat uchun hali qabul qilinadi.
   * Kelajakda: cookie dan o'qiladi.
   */
  @ApiProperty({ required: false, description: 'Deprecated: cookie-based flow ga o\'ting' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  refreshToken?: string;
}
