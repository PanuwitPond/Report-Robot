import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceEntity, RoiEntity, ScheduleEntity } from './entities';
import { DevicesService, RoisService, SchedulesService } from './services';
import { DevicesController, RoisController, SchedulesController } from './controllers';
// Import ของใหม่
import { IvCamerasController } from './controllers/iv-cameras.controller';
import { IvCamerasService } from './services/iv-cameras.service';

@Module({
    imports: [TypeOrmModule.forFeature([DeviceEntity, RoiEntity, ScheduleEntity])],
    providers: [
        DevicesService, 
        RoisService, 
        SchedulesService, 
        IvCamerasService // เพิ่ม Service
    ],
    controllers: [
        DevicesController, 
        RoisController, 
        SchedulesController, 
        IvCamerasController // เพิ่ม Controller
    ],
    exports: [DevicesService, RoisService, SchedulesService, IvCamerasService],
})
export class MroiModule {}