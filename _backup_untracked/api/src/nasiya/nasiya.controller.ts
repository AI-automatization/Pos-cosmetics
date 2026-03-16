import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NasiyaService } from './nasiya.service';

@ApiTags('Nasiya')
@ApiBearerAuth()
@Controller('nasiya')
export class NasiyaController {
  constructor(private readonly nasiyaService: NasiyaService) {}

  @Get('debtors')
  @ApiOperation({ summary: 'Get list of debtors (nasiya)' })
  getDebtors(@Query('branchId') branchId?: string) {
    return this.nasiyaService.getDebtors(branchId);
  }

  @Get('debtors/:id')
  @ApiOperation({ summary: 'Get debtor details with payment history' })
  getDebtorById(@Param('id') id: string) {
    return this.nasiyaService.getDebtorById(id);
  }

  @Post('payments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a debt payment' })
  recordPayment(
    @Body() body: { debtorId: string; amount: number; paymentMethod: string; note?: string },
  ) {
    return this.nasiyaService.recordPayment(body);
  }

  @Post('debtors/:id/remind')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send payment reminder to debtor' })
  sendReminder(@Param('id') id: string) {
    return this.nasiyaService.sendReminder(id);
  }
}
