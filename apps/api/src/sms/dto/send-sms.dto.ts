import { IsString, IsOptional, IsArray, MaxLength, IsDateString, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendSmsDto {
  @ApiProperty({ description: 'Telefon raqam (998XXXXXXXXX)' })
  @IsString()
  phone!: string;

  @ApiProperty({ description: 'SMS matn (max 160 belgi)' })
  @IsString()
  @MaxLength(160)
  text!: string;
}

export class CreateCampaignDto {
  @ApiProperty({ description: 'Kampaniya nomi' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'SMS matn shabloni (max 160 belgi)' })
  @IsString()
  @MaxLength(160)
  content!: string;

  @ApiProperty({ description: 'Qabul qiluvchilar telefon raqamlari', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  phones!: string[];
}

export class ScheduleCampaignDto {
  @ApiProperty({ description: 'Yuborish vaqti (ISO 8601)' })
  @IsDateString()
  scheduledAt!: string;
}

export class UnsubscribeDto {
  @ApiProperty({ description: 'Telefon raqam' })
  @IsString()
  phone!: string;

  @ApiProperty({ description: 'Tenant ID', required: false })
  @IsOptional()
  @IsString()
  tenantId?: string;
}
