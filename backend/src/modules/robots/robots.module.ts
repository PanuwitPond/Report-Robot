import { Module } from '@nestjs/common';
import { RobotsController } from './robots.controller';
import { RobotsService } from './robots.service';
import { RobotRepository } from './repositories/robot.repository';

@Module({
  controllers: [RobotsController],
  providers: [
    RobotsService,
    {
      provide: 'ROBOT_REPOSITORY',
      useClass: RobotRepository,
    },
  ],
})
export class RobotsModule {}