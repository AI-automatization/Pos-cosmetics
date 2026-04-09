import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEmployeeDto {
  @IsString() firstName!: string;
  @IsString() lastName!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(6) password!: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsString() phone?: string;
}

export class UpdateStatusDto {
  @IsEnum(['active', 'inactive', 'fired'], {
    message: 'status must be one of: active, inactive, fired',
  })
  status!: 'active' | 'inactive' | 'fired';
}

export class UpdatePosAccessDto {
  @IsBoolean()
  hasPosAccess!: boolean;
}
