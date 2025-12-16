import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        // การเชื่อมต่อฐานข้อมูลหลักของระบบ (Default)
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DATABASE_HOST'),
                port: configService.get('DATABASE_PORT'),
                username: configService.get('DATABASE_USERNAME'),
                password: configService.get('DATABASE_PASSWORD'),
                database: configService.get('DATABASE_NAME'),
                entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                synchronize: false,
                logging: false,
            }),
            inject: [ConfigService],
        }),

        // การเชื่อมต่อฐานข้อมูล MROI (เชื่อมต่อไปยัง 192.168.100.83)
        TypeOrmModule.forRootAsync({
            name: 'mroi_db_conn', // ชื่อการเชื่อมต่อสำหรับเรียกใช้ใน Service
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('MROI_DB_HOST'),
                port: configService.get('MROI_DB_PORT'),
                username: configService.get('MROI_DB_USERNAME'),
                password: configService.get('MROI_DB_PASSWORD'),
                database: configService.get('MROI_DB_NAME'), // ค่าคือ ivs_service
                entities: [], 
                synchronize: false,
                logging: false,
            }),
            inject: [ConfigService],
        }),
    ],
})
export class DatabaseModule { }