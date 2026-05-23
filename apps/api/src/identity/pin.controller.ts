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
import { CurrentUser } from '../common/decorators';
import { SetPinDto, VerifyPinDto } from './dto';
import { PinService } from './pin.service';

@ApiTags('Auth')
@Controller('auth')
export class PinController {
  constructor(private readonly pinService: PinService) {}

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
}
