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
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentTenant, CurrentUser, Roles } from '../common/decorators';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi task yaratish' })
  create(
    @Body() dto: CreateTaskDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.tasksService.create(dto, tenantId, userId);
  }

  @Get()
  @ApiOperation({ summary: "Barcha tasklarni ko'rish" })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.tasksService.findAll(
      tenantId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Task yangilash (status, title va h.k.)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.tasksService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Task o'chirish" })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.tasksService.remove(id, tenantId);
  }
}
