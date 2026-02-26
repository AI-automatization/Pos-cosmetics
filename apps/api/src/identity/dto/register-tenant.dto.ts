import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterTenantDto {
  @ApiProperty({ example: 'My Store' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  tenantName!: string;

  @ApiProperty({ example: 'my-store' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must contain only lowercase letters, numbers, and hyphens',
  })
  @MinLength(3)
  @MaxLength(50)
  slug!: string;

  @ApiProperty({ example: 'owner@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecureP@ss123' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName!: string;
}
