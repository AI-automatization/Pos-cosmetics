import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { AdminDatabaseService } from './admin-database.service';

@ApiTags('Super Admin — Database')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/db')
export class AdminDatabaseController {
  constructor(private readonly dbService: AdminDatabaseService) {}

  // ─── READ ──────────────────────────────────────────────────────────────────

  @Get('tables')
  @ApiOperation({ summary: 'Список всех таблиц с количеством записей и размером' })
  listTables() {
    return this.dbService.listTables();
  }

  @Get('tables/:tableName/schema')
  @ApiOperation({ summary: 'Структура таблицы: колонки, типы, индексы' })
  getTableSchema(@Param('tableName') tableName: string) {
    return this.dbService.getTableSchema(tableName);
  }

  @Get('tables/:tableName/data')
  @ApiOperation({ summary: 'Данные таблицы с пагинацией, фильтрацией, сортировкой' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'tenantId', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'sortDir', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  getTableData(
    @Param('tableName') tableName: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('tenantId') tenantId?: string,
    @Query('sort') sort?: string,
    @Query('sortDir') sortDir?: string,
    @Query('search') search?: string,
  ) {
    return this.dbService.getTableData(tableName, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      tenantId,
      sort,
      sortDir: sortDir === 'desc' ? 'desc' : 'asc',
      search,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Статистика БД: размер, подключения, uptime, версия' })
  getStats() {
    return this.dbService.getStats();
  }

  @Get('migrations')
  @ApiOperation({ summary: 'История Prisma миграций' })
  getMigrations() {
    return this.dbService.getMigrations();
  }

  @Get('tables/:tableName/export')
  @ApiOperation({ summary: 'Экс��орт таблицы в CSV' })
  @ApiQuery({ name: 'tenantId', required: false, type: String })
  async exportTable(
    @Param('tableName') tableName: string,
    @Query('tenantId') tenantId: string | undefined,
    @Res() res: Response,
  ) {
    const csv = await this.dbService.exportTable(tableName, tenantId);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${tableName}.csv"`);
    res.status(200).end(csv);
  }

  // ─── CREATE ────────────────────────────────────────────────────────────────

  @Post('tables/:tableName/rows')
  @ApiOperation({ summary: 'Создать новую запись в таблице' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['data'],
      properties: { data: { type: 'object', description: 'Поля записи' } },
    },
  })
  createRow(
    @Param('tableName') tableName: string,
    @Body('data') data: Record<string, unknown>,
  ) {
    return this.dbService.createRow(tableName, data);
  }

  // ─── UPDATE ────────────────────────────────────────────────────────────────

  @Patch('tables/:tableName/rows/:id')
  @ApiOperation({ summary: 'Обновить запись по ID' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['data'],
      properties: { data: { type: 'object', description: 'Поля для обновления' } },
    },
  })
  updateRow(
    @Param('tableName') tableName: string,
    @Param('id') id: string,
    @Body('data') data: Record<string, unknown>,
  ) {
    return this.dbService.updateRow(tableName, id, data);
  }

  @Put('tables/:tableName/rows/bulk')
  @ApiOperation({ summary: 'Массовое обновление записей (до 100)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['ids', 'data'],
      properties: {
        ids: { type: 'array', items: { type: 'string' } },
        data: { type: 'object' },
      },
    },
  })
  bulkUpdate(
    @Param('tableName') tableName: string,
    @Body() body: { ids: string[]; data: Record<string, unknown> },
  ) {
    return this.dbService.bulkUpdate(tableName, body.ids, body.data);
  }

  // ─── DELETE ────────────────────────────────────────────────────────────────

  @Delete('tables/:tableName/rows/:id')
  @ApiOperation({ summary: 'Удалить запись по ID' })
  deleteRow(
    @Param('tableName') tableName: string,
    @Param('id') id: string,
  ) {
    return this.dbService.deleteRow(tableName, id);
  }

  @Delete('tables/:tableName/rows/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Массовое удаление записей (до 100)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['ids'],
      properties: { ids: { type: 'array', items: { type: 'string' } } },
    },
  })
  bulkDelete(
    @Param('tableName') tableName: string,
    @Body() body: { ids: string[] },
  ) {
    return this.dbService.bulkDelete(tableName, body.ids);
  }

  // ─── SQL CONSOLE ───────────────────────────────────────────────────────────

  @Post('query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'SQL Console — выполнить любой SQL запрос (ПОЛНЫЙ ДОСТУП)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['sql'],
      properties: {
        sql: { type: 'string', description: 'SQL запрос', example: 'SELECT * FROM tenants LIMIT 10' },
      },
    },
  })
  executeQuery(@Body('sql') sql: string) {
    return this.dbService.executeQuery(sql);
  }
}
