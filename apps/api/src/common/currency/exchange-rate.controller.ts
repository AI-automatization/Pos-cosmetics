import { Controller, Get, Post, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ExchangeRateService } from './exchange-rate.service';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('Exchange Rate')
@ApiBearerAuth()
@Controller('exchange-rate')
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Get('latest')
  @ApiOperation({ summary: 'Eng so\'ngi USD/UZS kurs (CBU)' })
  getLatest() {
    return this.exchangeRateService.getLatestRate();
  }

  @Get('history')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Kurs tarixi (oxirgi N kun)' })
  @ApiQuery({ name: 'days', required: false, example: 30 })
  getHistory(@Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number) {
    return this.exchangeRateService.getRateHistory(days);
  }

  @Post('sync')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'CBU dan kursni qo\'lda yangilash' })
  syncFromCbu() {
    return this.exchangeRateService.syncFromCbu();
  }
}
