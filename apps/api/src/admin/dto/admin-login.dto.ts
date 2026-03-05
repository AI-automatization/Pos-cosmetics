import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@raos.uz' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @MinLength(6)
  password!: string;
}

export class AdminCreateDto {
  @ApiProperty({ example: 'Super Admin' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'admin@raos.uz' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @MinLength(8)
  password!: string;
}
