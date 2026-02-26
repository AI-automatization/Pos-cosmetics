import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'owner@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecureP@ss123' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: 'my-store', description: 'Tenant slug' })
  @IsString()
  @IsNotEmpty()
  slug!: string;
}
