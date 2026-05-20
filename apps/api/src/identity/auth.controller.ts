import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import { Request, Response } from 'express';
import { CurrentUser, Public } from '../common/decorators';
import {
  LoginDto,
  RefreshTokenDto,
  RegisterTenantDto,
  UpdateTenantInfoDto,
} from './dto';
import { Roles } from '../common/decorators/roles.decorator';
import { IdentityService } from './identity.service';
import { SessionService } from './session.service';

export const REFRESH_COOKIE = 'refreshToken';
export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  // SameSite=None required for cross-origin Railway deployment (frontend ≠ backend domain).
  // SameSite=Strict blocks XHR cookies on cross-site requests → refresh always 401 in prod.
  // SameSite=None requires Secure=true — already set in production.
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 kun
  path: '/',
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly identityService: IdentityService,
    private readonly sessionService: SessionService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  @ApiOperation({ summary: 'Register a new tenant with owner account' })
  @ApiResponse({ status: 201, description: 'Tenant registered successfully' })
  @ApiResponse({ status: 409, description: 'Slug already taken' })
  async register(@Body() dto: RegisterTenantDto) {
    return this.identityService.register(dto);
  }

  // T-077: login — 10 urinish/min (IP bo'yicha, brute-force himoya)
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email, password, and tenant slug' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.identityService.loginWithSession(dto, {
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string | undefined,
      sessionService: this.sessionService,
    });
    // T-347: refreshToken httpOnly cookie — XSS dan himoya
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    return { accessToken: tokens.accessToken };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // T-347: cookie prioritet, body fallback (mobile backward compat)
    const refreshToken =
      (req.cookies as Record<string, string>)?.[REFRESH_COOKIE] ?? dto.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token talab qilinadi');
    }
    const tokens = await this.identityService.refreshTokens({
      userId: dto.userId,
      refreshToken,
    });
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout — invalidate refresh token' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(
    @CurrentUser('userId') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.identityService.logout(userId);
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  async me(@CurrentUser('userId') userId: string) {
    return this.identityService.getProfile(userId);
  }

  // ─── T-079: Tenant soliq ma'lumotlari ──────────────────────────

  @Get('tenant')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tenant ma\'lumotlari (INN, STIR, yuridik nomi)' })
  getTenant(@CurrentUser('tenantId') tenantId: string) {
    return this.identityService.getTenantInfo(tenantId);
  }

  @Patch('tenant')
  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Tenant soliq ma\'lumotlarini yangilash (T-079)' })
  updateTenant(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: UpdateTenantInfoDto,
  ) {
    return this.identityService.updateTenantInfo(tenantId, dto);
  }

  // ─── T-069: SESSION MANAGEMENT ────────────────────────────────

  @Get('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Foydalanuvchi aktiv sessiyalari (T-069)' })
  getSessions(
    @CurrentUser('userId') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.sessionService.getSessions(userId, tenantId);
  }

  @Delete('sessions/all')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Barcha sessiyalarni tugatish (logout everywhere)' })
  deleteAllSessions(
    @CurrentUser('userId') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.sessionService.deleteAllMySessions(userId, tenantId);
  }

  @Delete('sessions/:id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bitta sessionni tugatish' })
  @ApiParam({ name: 'id', type: String })
  deleteSession(
    @Param('id', ParseUUIDPipe) sessionId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.sessionService.deleteSession(sessionId, userId, tenantId);
  }

  @Get('sessions/all')
  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Tenant dagi barcha sessiyalar (ADMIN)' })
  getAllSessions(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.sessionService.getAllSessions(tenantId, role);
  }

  @Delete('sessions/user/:userId')
  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xodimni force-logout qilish (ADMIN)' })
  @ApiParam({ name: 'userId', type: String })
  forceLogout(
    @Param('userId', ParseUUIDPipe) targetUserId: string,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.sessionService.forceLogoutUser(targetUserId, tenantId, role);
  }
}
