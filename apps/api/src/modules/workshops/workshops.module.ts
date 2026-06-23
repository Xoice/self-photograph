import { Module } from '@nestjs/common';
import { WorkshopsService } from './workshops.service';
import { WorkshopsController } from './workshops.controller';
import { AdminWorkshopsController } from './admin-workshops.controller';

@Module({
  controllers: [WorkshopsController, AdminWorkshopsController],
  providers: [WorkshopsService],
  exports: [WorkshopsService],
})
export class WorkshopsModule {}
