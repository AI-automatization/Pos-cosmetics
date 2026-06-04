import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../common/decorators';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto, AdminCreateDto } from './dto/admin-login.dto';
import { SuperAdminGuard } from './guards/super-admin.guard';

@ApiTags('Super Admin — Auth')
@Controller('admin')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Public()
  @Post('auth/login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Super Admin login (httpOnly cookie)' })
  async login(@Body() dto: AdminLoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.adminAuthService.login(dto);

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('sa_access_token', result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    return result;
  }

  @Public()
  @Post('auth/logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Super Admin logout — clear httpOnly cookie' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('sa_access_token', { path: '/' });
    return { success: true };
  }

  @Public()
  @Post('auth/bootstrap')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Birinchi Super Admin yaratish (ADMIN_BOOTSTRAP_SECRET kerak)' })
  bootstrap(@Body() dto: AdminCreateDto, @Headers('x-bootstrap-secret') secret: string) {
    return this.adminAuthService.bootstrap(dto, secret);
  }

  @Public()
  @Post('auth/reset-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User parolini reset qilish (ADMIN_BOOTSTRAP_SECRET kerak)' })
  resetUserPassword(
    @Body() body: { email: string; newPassword: string },
    @Headers('x-bootstrap-secret') secret: string,
  ) {
    return this.adminAuthService.resetUserPassword(body.email, body.newPassword, secret);
  }

  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @Post('auth/create')
  @ApiOperation({ summary: 'Yangi Super Admin yaratish' })
  createAdmin(@Body() dto: AdminCreateDto) {
    return this.adminAuthService.createAdmin(dto);
  }
}
