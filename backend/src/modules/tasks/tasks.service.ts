import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { StorageService } from '@/storage/storage.service';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>,
        private storageService: StorageService,
    ) { }

    async findAll(domain: string): Promise<Task[]> {
        return this.tasksRepository.find({
            where: { domain },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Task> {
        return this.tasksRepository.findOne({ where: { id } });
    }

    async create(createTaskDto: CreateTaskDto, file?: Express.Multer.File): Promise<Task> {
        let imageUrl: string | null = null;

        if (file) {
            imageUrl = await this.storageService.uploadFile(file, createTaskDto.domain, 'tasks');
        }

        const task = this.tasksRepository.create({
            ...createTaskDto,
            imageUrl,
        });

        return this.tasksRepository.save(task);
    }

    async update(id: string, updateData: Partial<CreateTaskDto>, file?: Express.Multer.File): Promise<Task> {
        const task = await this.findOne(id);

        if (file) {
            // Delete old image if exists
            if (task.imageUrl) {
                await this.storageService.deleteFile(task.imageUrl);
            }
            task.imageUrl = await this.storageService.uploadFile(file, task.domain, 'tasks');
        }

        Object.assign(task, updateData);
        return this.tasksRepository.save(task);
    }

    async delete(id: string): Promise<void> {
        const task = await this.findOne(id);

        if (task.imageUrl) {
            await this.storageService.deleteFile(task.imageUrl);
        }

        await this.tasksRepository.delete(id);
    }
}
