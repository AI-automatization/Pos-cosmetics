import { IsString, IsUUID, MaxLength } from 'class-validator';

export class RegisterBiometricDto {
  @IsString()
  @MaxLength(2048)
  publicKey!: string;

  @IsString()
  @MaxLength(255)
  deviceId!: string;
}

export class VerifyBiometricDto {
  @IsString()
  @MaxLength(128)
  biometricToken!: string;

  @IsString()
  @MaxLength(255)
  deviceId!: string;

  /** Tenant filter — cross-tenant full scan ni oldini oladi */
  @IsUUID()
  tenantId!: string;
}
