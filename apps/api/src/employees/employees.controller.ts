import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class CreateEmployeeDto {
  @IsString() firstName!: string;
  @IsString() lastName!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(6) password!: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsString() phone?: string;
}

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly svc: EmployeesService) {}

  // GET /employees
  @Get()
  @ApiOperation({ summary: 'T-224: Barcha xodimlar ro\'yxati' })
  @ApiQuery({ name: 'branch_id', required: false })
  getAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branch_id') branchId?: string,
  ) {
    return this.svc.getAll(tenantId, branchId);
  }

  // GET /employees/performance
  @Get('performance')
  @ApiOperation({ summary: 'T-224: Xodimlar samaradorligi' })
  @ApiQuery({ name: 'branch_id', required: false })
  @ApiQuery({ name: 'from_date', required: false })
  @ApiQuery({ name: 'to_date', required: false })
  @ApiQuery({ name: 'period', required: false })
  getPerformance(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branch_id') branchId?: string,
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string,
    @Query('period') period?: string,
  ) {
    return this.svc.getPerformance(tenantId, { branchId, fromDate, toDate, period });
  }

  // GET /employees/suspicious-activity
  @Get('suspicious-activity')
  @ApiOperation({ summary: 'T-224: Shubhali harakatlar (barcha xodimlar)' })
  @ApiQuery({ name: 'branch_id', required: false })
  @ApiQuery({ name: 'from_date', required: false })
  @ApiQuery({ name: 'to_date', required: false })
  @ApiQuery({ name: 'severity', required: false, enum: ['low', 'medium', 'high'] })
  getSuspiciousActivity(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branch_id') branchId?: string,
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string,
    @Query('severity') severity?: string,
  ) {
    return this.svc.getSuspiciousActivity(tenantId, { branchId, fromDate, toDate, severity });
  }

  // GET /employees/:id
  @Get(':id')
  @ApiOperation({ summary: 'T-224: Xodim ma\'lumotlari' })
  @ApiParam({ name: 'id', type: String })
  getById(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.svc.getById(tenantId, id);
  }

  // POST /employees
  @Post()
  @ApiOperation({ summary: 'T-224: Yangi xodim yaratish' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateEmployeeDto,
  ) {
    return this.svc.create(tenantId, dto);
  }

  // PATCH /employees/:id/status
  @Patch(':id/status')
  @ApiOperation({ summary: 'T-144: Xodim statusini o\'zgartirish (active|inactive|fired)' })
  @ApiParam({ name: 'id', type: String })
  updateStatus(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: { status: 'active' | 'inactive' | 'fired' },
  ) {
    return this.svc.updateStatus(tenantId, id, body.status);
  }

  // PATCH /employees/:id/pos-access
  @Patch(':id/pos-access')
  @ApiOperation({ summary: 'T-224: POS kirish ruxsatini o\'zgartirish' })
  @ApiParam({ name: 'id', type: String })
  updatePosAccess(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: { hasPosAccess: boolean },
  ) {
    return this.svc.updatePosAccess(tenantId, id, body.hasPosAccess);
  }

  // GET /employees/:id/performance
  @Get(':id/performance')
  @ApiOperation({ summary: 'T-224: Bitta xodim samaradorligi' })
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({ name: 'from_date', required: false })
  @ApiQuery({ name: 'to_date', required: false })
  getEmployeePerformance(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string,
  ) {
    return this.svc.getEmployeePerformance(tenantId, id, { fromDate, toDate });
  }

  // GET /employees/:id/suspicious-activity
  @Get(':id/suspicious-activity')
  @ApiOperation({ summary: 'T-224: Bitta xodim shubhali harakatlari' })
  @ApiParam({ name: 'id', type: String })
  getEmployeeSuspiciousActivity(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.svc.getEmployeeSuspiciousActivity(tenantId, id);
  }

  // DELETE /employees/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'T-224: Xodimni o\'chirish (soft deactivate)' })
  @ApiParam({ name: 'id', type: String })
  async delete(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    await this.svc.delete(tenantId, id);
  }
}
