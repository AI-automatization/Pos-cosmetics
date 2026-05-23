import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser, Public } from '../common/decorators';
import { PasswordResetService } from './password-reset.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class PasswordController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  // ─── PASSWORD RESET ─────────────────────────────────────────────

  @Public()
  @Post('forgot-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send password reset OTP to email' })
  forgotPassword(@Body() dto: { email: string }) {
    return this.passwordResetService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using OTP' })
  resetPassword(@Body() dto: { email: string; otp: string; newPassword: string }) {
    return this.passwordResetService.resetPassword(dto.email, dto.otp, dto.newPassword);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change own password (logged-in user)' })
  changePassword(
    @CurrentUser('userId') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: { oldPassword: string; newPassword: string },
  ) {
    return this.passwordResetService.changePassword(userId, tenantId, dto.oldPassword, dto.newPassword);
  }
}
