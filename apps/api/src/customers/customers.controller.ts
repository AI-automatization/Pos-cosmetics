import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List all customers' })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('search') search?: string,
  ) {
    return this.customersService.findAll(tenantId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiParam({ name: 'id', type: String })
  findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.customersService.findById(tenantId, id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get customer statistics (orders, spent, debt)' })
  @ApiParam({ name: 'id', type: String })
  getStats(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.customersService.getCustomerStats(tenantId, id);
  }

  @Post()
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
