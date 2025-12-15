import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceEntity, RoiEntity, ScheduleEntity } from './entities';
import { DevicesService, RoisService, SchedulesService } from './services';
import { DevicesController, RoisController, SchedulesController } from './controllers';

@Module({
    imports: [TypeOrmModule.forFeature([DeviceEntity, RoiEntity, ScheduleEntity])],
    providers: [DevicesService, RoisService, SchedulesService],
    controllers: [DevicesController, RoisController, SchedulesController],
    exports: [DevicesService, RoisService, SchedulesService],
})
export class MroiModule {}
