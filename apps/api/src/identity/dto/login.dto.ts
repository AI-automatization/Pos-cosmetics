import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

/**
 * T-145: email (admin/web) yoki login (POS/kassir) bilan kirish
 * Kamida bittasi: email YOKI login bo'lishi SHART
 */
export class LoginDto {
  @ApiProperty({ example: 'owner@example.com', required: false, description: 'Email (admin/web uchun)' })
  @ValidateIf((o: LoginDto) => !o.login)
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @ApiProperty({ example: 'kassir01', required: false, description: 'Login/username (POS kassir uchun). email bilan bir xil ishlaydi.' })
  @ValidateIf((o: LoginDto) => !o.email)
  @IsString()
  @IsNotEmpty()
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
