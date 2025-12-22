import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';

@Module({
    imports: [HttpModule, ConfigModule],
    controllers: [UsersController],
    providers: [
        UsersService,
        {
            provide: 'USER_REPOSITORY',
            useClass: UserRepository,
        },
    ],
    exports: [UsersService],
})
export class UsersModule { }
