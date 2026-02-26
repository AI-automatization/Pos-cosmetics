import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Public } from '../common/decorators';
import { LoginDto, RefreshTokenDto, RegisterTenantDto } from './dto';
import { IdentityService } from './identity.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly identityService: IdentityService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new tenant with owner account' })
  @ApiResponse({ status: 201, description: 'Tenant registered successfully' })
  @ApiResponse({ status: 409, description: 'Slug already taken' })
  async register(@Body() dto: RegisterTenantDto) {
    return this.identityService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email, password, and tenant slug' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    return this.identityService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.identityService.refreshTokens(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout — invalidate refresh token' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@CurrentUser('userId') userId: string) {
    await this.identityService.logout(userId);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  async me(@CurrentUser('userId') userId: string) {
    return this.identityService.getProfile(userId);
  }
}
