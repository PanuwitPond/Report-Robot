import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // เพิ่ม ConfigService
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './modules/auth/auth.module';
import { ReportsModule } from './modules/reports/reports.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ImagesModule } from './modules/images/images.module';
import { UsersModule } from './modules/users/users.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        
        // 1. Connection หลัก (Know DB) - ใช้ DatabaseModule จัดการ (ไม่ต้องแก้)
        DatabaseModule,

        // 2. Connection รอง (MIOC DB) - แก้ไขส่วนนี้
        TypeOrmModule.forRootAsync({
            name: 'mioc_conn', // ชื่อ Connection
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('MIOC_DB_HOST'),
                port: configService.get<number>('MIOC_DB_PORT'),
                username: configService.get<string>('MIOC_DB_USERNAME'),
                password: configService.get<string>('MIOC_DB_PASSWORD'),
                database: configService.get<string>('MIOC_DB_NAME'),
                synchronize: false,
                autoLoadEntities: false, // เราใช้ Raw Query ไม่ต้องโหลด Entity
            }),
        }),

        StorageModule,
        AuthModule,
        ReportsModule,
        TasksModule,
        ImagesModule,
        UsersModule,
    ],
})
export class AppModule { }