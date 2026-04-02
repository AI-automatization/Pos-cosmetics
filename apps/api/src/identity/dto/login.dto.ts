import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'owner@example.com' })
  @IsEmail()
  email!: string;

  /** T-145: username (login) orqali ham kirish mumkin */
  @ApiProperty({ required: false, example: 'sarvar_cashier' })
  @IsOptional()
  @IsString()
  login?: string;

  @ApiProperty({ example: 'SecureP@ss123' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: 'my-store', description: 'Tenant slug' })
  @IsString()
  @IsNotEmpty()
  slug!: string;
}
