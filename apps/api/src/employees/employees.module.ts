import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { EmployeesHelper } from './employees.helper';
import { EmployeesActivityHelper } from './employees-activity.helper';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [EmployeesController],
  providers: [EmployeesService, EmployeesHelper, EmployeesActivityHelper],
})
export class EmployeesModule {}
