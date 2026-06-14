import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Customers')
@ApiBearerAuth()
@Roles('OWNER', 'ADMIN', 'MANAGER')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'List customers (paginated)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('search') search?: string,
    @Query('branchId') branchId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.customersService.findAll(
      tenantId, search, branchId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get(':id')
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiParam({ name: 'id', type: String })
  findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.customersService.findById(tenantId, id);
  }

  @Get(':id/stats')
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'Get customer statistics (orders, spent, debt)' })
  @ApiParam({ name: 'id', type: String })
  getStats(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.customersService.getCustomerStats(tenantId, id);
  }

  @Post()
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'Create customer' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.customersService.create(tenantId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer' })
  @ApiParam({ name: 'id', type: String })
  update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate customer' })
  @ApiParam({ name: 'id', type: String })
  remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.customersService.delete(tenantId, id);
  }
}
