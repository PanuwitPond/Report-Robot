"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const database_module_1 = require("./database/database.module");
const storage_module_1 = require("./storage/storage.module");
const auth_module_1 = require("./modules/auth/auth.module");
const reports_module_1 = require("./modules/reports/reports.module");
const tasks_module_1 = require("./modules/tasks/tasks.module");
const images_module_1 = require("./modules/images/images.module");
const users_module_1 = require("./modules/users/users.module");
const robots_module_1 = require("./modules/robots/robots.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            database_module_1.DatabaseModule,
            typeorm_1.TypeOrmModule.forRootAsync({
                name: 'mioc_conn',
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('MIOC_DB_HOST'),
                    port: configService.get('MIOC_DB_PORT'),
                    username: configService.get('MIOC_DB_USERNAME'),
                    password: configService.get('MIOC_DB_PASSWORD'),
                    database: configService.get('MIOC_DB_NAME'),
                    synchronize: false,
                    autoLoadEntities: false,
                }),
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                name: 'robot_conn',
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('ROBOT_DB_HOST'),
                    port: configService.get('ROBOT_DB_PORT'),
                    username: configService.get('ROBOT_DB_USER'),
                    password: configService.get('ROBOT_DB_PASSWORD'),
                    database: configService.get('ROBOT_DB_NAME'),
                    synchronize: false,
                    autoLoadEntities: false,
                    ssl: { rejectUnauthorized: false }
                }),
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                name: 'wf_conn',
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('WF_DB_HOST'),
                    port: configService.get('WF_DB_PORT'),
                    username: configService.get('WF_DB_USER'),
                    password: configService.get('WF_DB_PASSWORD'),
                    database: configService.get('WF_DB_NAME'),
                    synchronize: false,
                    autoLoadEntities: false,
                    ssl: { rejectUnauthorized: false }
                }),
            }),
            storage_module_1.StorageModule,
            auth_module_1.AuthModule,
            reports_module_1.ReportsModule,
            tasks_module_1.TasksModule,
            images_module_1.ImagesModule,
            users_module_1.UsersModule,
            robots_module_1.RobotsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map