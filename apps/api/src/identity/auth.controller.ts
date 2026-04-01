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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsNumber, Min, Max } from 'class-validator';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import { Request, Response } from 'express';
import { CurrentUser, Public } from '../common/decorators';
import { LoginDto, RefreshTokenDto, RegisterTenantDto, SetPinDto, UpdateTenantInfoDto, VerifyPinDto, RegisterBiometricDto, VerifyBiometricDto } from './dto';
import { Roles } from '../common/decorators/roles.decorator';
import { IdentityService } from './identity.service';
import { PinService } from './pin.service';
import { SessionService } from './session.service';
import { ApiKeyService, API_KEY_SCOPES } from './api-key.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { randomUUID, timingSafeEqual } from 'crypto';

class CreateApiKeyDto {
  @ApiProperty({ example: 'POS-Branch-1' })
  @IsString()
  name!: string;

  @ApiProperty({ example: ['sync:read', 'sync:write'], required: false })
  @IsOptional()
  @IsArray()
  scopes?: string[];

  @ApiProperty({ example: 'branch-uuid', required: false })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiProperty({ example: 365, required: false, description: 'Expire in N days. Omit for no expiry.' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3650)
  expiresInDays?: number;
}

const REFRESH_COOKIE = 'refreshToken';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 kun
  path: '/',
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly identityService: IdentityService,
    private readonly pinService: PinService,
    private readonly sessionService: SessionService,
    private readonly apiKeyService: ApiKeyService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
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

  // ─── PIN ENDPOINTS (T-068) ────────────────────────────────────

  @Post('pin/set')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'PIN o\'rnatish yoki o\'zgartirish (4-6 raqam)' })
  @ApiResponse({ status: 200, description: 'PIN o\'rnatildi' })
  async setPin(
    @CurrentUser('userId') userId: string,
    @Body() dto: SetPinDto,
  ) {
    await this.pinService.setPin(userId, dto.pin, dto.oldPin);
    return { message: 'PIN muvaffaqiyatli o\'rnatildi' };
  }

  @Post('pin/verify')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'PIN tekshirish (sensitive operatsiya oldidan)' })
  @ApiResponse({ status: 200, description: 'PIN to\'g\'ri' })
  @ApiResponse({ status: 401, description: 'PIN noto\'g\'ri yoki bloklangan' })
  async verifyPin(
    @CurrentUser('userId') userId: string,
    @Body() dto: VerifyPinDto,
  ) {
    await this.pinService.verifyPin(userId, dto.pin, dto.action);
    return { verified: true, action: dto.action };
  }

  @Get('pin/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'PIN o\'rnatilganmi tekshirish' })
  async pinStatus(@CurrentUser('userId') userId: string) {
    const hasPin = await this.pinService.hasPinSet(userId);
    return { hasPinSet: hasPin };
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

  // ─── T-071: API KEY MANAGEMENT ────────────────────────────────

  @Post('api-keys')
  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Yangi API key yaratish (POS sync uchun) (T-071)' })
  @ApiResponse({ status: 201, description: 'API key yaratildi. Key FAQAT SHU SAFAR ko\'rsatiladi!' })
  createApiKey(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateApiKeyDto,
  ) {
    return this.apiKeyService.createApiKey({
      tenantId,
      branchId: dto.branchId,
      name: dto.name,
      scopes: dto.scopes,
      expiresInDays: dto.expiresInDays,
    });
  }

  @Get('api-keys')
  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'API keylar ro\'yxati' })
  listApiKeys(@CurrentUser('tenantId') tenantId: string) {
    return this.apiKeyService.listApiKeys(tenantId);
  }

  @Get('api-keys/scopes')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mavjud API key scope\'lar' })
  getScopes() {
    return { scopes: API_KEY_SCOPES };
  }

  @Delete('api-keys/:id/revoke')
  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'API key ni o\'chirish (revoke)' })
  @ApiParam({ name: 'id', type: String })
  revokeApiKey(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.apiKeyService.revokeApiKey(id, tenantId);
  }

  @Delete('api-keys/:id')
  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'API key ni butunlay o\'chirish' })
  @ApiParam({ name: 'id', type: String })
  deleteApiKey(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.apiKeyService.deleteApiKey(id, tenantId);
  }

  // ─── T-225: BIOMETRIC ─────────────────────────────────────────

  /**
   * POST /auth/biometric/register
   * Logged-in user device uchun biometric token yaratadi.
   * Token 30 kunlik, botSettings JSON da saqlanadi.
   */
  @Post('biometric/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'T-225: Qurilma uchun biometric token ro\'yxatdan o\'tkazish' })
  async registerBiometric(
    @CurrentUser('userId') userId: string,
    @Body() dto: RegisterBiometricDto,
  ) {
    const biometricToken = randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000);

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const existing = (user.botSettings ?? {}) as Record<string, unknown>;
    const keys = (existing['biometricKeys'] ?? {}) as Record<string, unknown>;

    keys[dto.deviceId] = {
      token: biometricToken,
      publicKey: dto.publicKey,
      expiresAt: expiresAt.toISOString(),
    };

    await this.prisma.user.update({
      where: { id: userId },
      data: { botSettings: { ...existing, biometricKeys: keys } as object },
    });

    return { success: true, biometricToken, expiresAt };
  }

  /**
   * POST /auth/biometric/verify
   * biometricToken + deviceId orqali foydalanuvchi identifikatsiya va JWT qaytaradi.
   */
  @Public()
  @Post('biometric/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'T-225: Biometric token orqali login — JWT qaytaradi' })
  async verifyBiometric(
    @Body() dto: VerifyBiometricDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // T-346 fix 1: tenantId filter — cross-tenant full table scan bartaraf etildi
    const users = await this.prisma.user.findMany({
      where: { isActive: true, tenantId: dto.tenantId },
      select: { id: true, tenantId: true, email: true, role: true, firstName: true, lastName: true, botSettings: true },
    });

    const now = Date.now();
    let found: (typeof users)[0] | null = null;

    for (const u of users) {
      const settings = (u.botSettings ?? {}) as Record<string, unknown>;
      const keys = (settings['biometricKeys'] ?? {}) as Record<string, Record<string, string>>;
      const entry = keys[dto.deviceId];
      if (!entry || new Date(entry['expiresAt']).getTime() <= now) continue;

      // T-346 fix 2: timing attack — crypto.timingSafeEqual ishlatildi
      const storedBuf = Buffer.from(entry['token'] ?? '', 'utf8');
      const givenBuf = Buffer.from(dto.biometricToken, 'utf8');
      const tokenMatch =
        storedBuf.length === givenBuf.length &&
        timingSafeEqual(storedBuf, givenBuf);

      if (tokenMatch) {
        found = u;
        break;
      }
    }

    if (!found) {
      throw new UnauthorizedException('Biometric token yaroqsiz yoki muddati o\'tgan');
    }

    // Token muddatini yangilaymiz
    const settings = (found.botSettings ?? {}) as Record<string, unknown>;
    const keys = (settings['biometricKeys'] ?? {}) as Record<string, Record<string, string>>;
    keys[dto.deviceId] = {
      ...keys[dto.deviceId],
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    };
    await this.prisma.user.update({
      where: { id: found.id },
      data: { botSettings: { ...settings, biometricKeys: keys } as object },
    });

    const tokens = await this.identityService.loginById(found.id);
    // T-347: refreshToken httpOnly cookie — body dan olib tashlandi
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    return {
      accessToken: tokens.accessToken,
      user: {
        id: found.id,
        email: found.email,
        firstName: found.firstName,
        lastName: found.lastName,
        role: found.role,
        tenantId: found.tenantId,
      },
    };
  }
}
