import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { PIN_ACTIONS, PinAction } from '../pin.service';

export class SetPinDto {
  @ApiProperty({ example: '1234', description: '4-6 ta raqam' })
  @IsString()
  @Matches(/^\d{4,6}$/, { message: 'PIN 4-6 ta raqamdan iborat bo\'lishi kerak' })
  pin!: string;

  @ApiPropertyOptional({ example: '0000', description: 'Eski PIN (faqat PIN o\'zgartirish uchun)' })
  @IsOptional()
  @IsString()
  oldPin?: string;
}

export class VerifyPinDto {
  @ApiProperty({ example: '1234' })
  @IsString()
  @Matches(/^\d{4,6}$/, { message: 'PIN 4-6 ta raqamdan iborat bo\'lishi kerak' })
  pin!: string;

  @ApiProperty({
    example: 'REFUND',
    enum: PIN_ACTIONS,
    description: 'Qaysi operatsiya uchun PIN kerak',
  })
  @IsIn(PIN_ACTIONS)
  action!: PinAction;
}
