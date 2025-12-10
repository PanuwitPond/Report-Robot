import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { RobotImage } from './entities/robot-image.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RobotImage])],
    controllers: [ImagesController],
    providers: [ImagesService],
})
export class ImagesModule { }
