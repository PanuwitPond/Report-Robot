"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("./entities/task.entity");
const storage_service_1 = require("../../storage/storage.service");
let TasksService = class TasksService {
    constructor(tasksRepository, storageService) {
        this.tasksRepository = tasksRepository;
        this.storageService = storageService;
    }
    async findAll(domain) {
        return this.tasksRepository.find({
            where: { domain },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        return this.tasksRepository.findOne({ where: { id } });
    }
    async create(createTaskDto, file) {
        let imageUrl = null;
        if (file) {
            imageUrl = await this.storageService.uploadFile(file, createTaskDto.domain, 'tasks');
        }
        const task = this.tasksRepository.create({
            ...createTaskDto,
            imageUrl,
        });
        return this.tasksRepository.save(task);
    }
    async update(id, updateData, file) {
        const task = await this.findOne(id);
        if (file) {
            if (task.imageUrl) {
                await this.storageService.deleteFile(task.imageUrl);
            }
            task.imageUrl = await this.storageService.uploadFile(file, task.domain, 'tasks');
        }
        Object.assign(task, updateData);
        return this.tasksRepository.save(task);
    }
    async delete(id) {
        const task = await this.findOne(id);
        if (task.imageUrl) {
            await this.storageService.deleteFile(task.imageUrl);
        }
        await this.tasksRepository.delete(id);
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        storage_service_1.StorageService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map