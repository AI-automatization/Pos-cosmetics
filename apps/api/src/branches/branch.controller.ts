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
import { BranchService, CreateBranchDto, UpdateBranchDto } from './branch.service';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Branches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha filiallarni ro\'yxat' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  getBranches(
    @CurrentUser('tenantId') tenantId: string,
    @Query('isActive') isActive?: string,
  ) {
    const active =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.branchService.getBranches(tenantId, active);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Filial ma\'lumoti (omborlar va hisoblar bilan)' })
  @ApiParam({ name: 'id', type: String })
  getBranch(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.branchService.getBranchById(tenantId, id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Filial statistikasi (buyurtmalar, tushum, smenalar)' })
  @ApiParam({ name: 'id', type: String })
  getBranchStats(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.branchService.getBranchStats(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Yangi filial yaratish' })
  createBranch(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateBranchDto,
  ) {
    return this.branchService.createBranch(tenantId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Filial ma\'lumotini yangilash' })
  @ApiParam({ name: 'id', type: String })
  updateBranch(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBranchDto,
  ) {
    return this.branchService.updateBranch(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Filialni o\'chirish (isActive=false)' })
  @ApiParam({ name: 'id', type: String })
  deactivateBranch(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.branchService.deactivateBranch(tenantId, id);
  }
}
