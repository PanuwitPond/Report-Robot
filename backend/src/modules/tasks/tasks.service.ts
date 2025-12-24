import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { StorageService } from '../../storage/storage.service';
import { ConfigService } from '@nestjs/config'; // เพิ่ม ConfigService
import * as path from 'path';

@Injectable()
export class TasksService {
    constructor(
       @InjectRepository(Task, 'ROBOT_CONNECTION')
        private readonly tasksRepository: Repository<Task>,
        private readonly storageService: StorageService,
        private readonly configService: ConfigService, // Inject ConfigService
    ) { }

    async findAll(domain: string) {
        // ส่งข้อมูลดิบออกไปเลย ไม่ต้อง map URL ที่นี่ (ให้ Frontend จัดการ)
        return this.tasksRepository.find();
    }

    async findOne(id: string) {
        // Fixed: Task uses task_id as primary key, not id
        const task = await this.tasksRepository.findOne({ where: { task_id: id } });
        if (!task) throw new NotFoundException('Task not found');
        return task;
    }

    async create(createTaskDto: CreateTaskDto, file: Express.Multer.File) {
    const fileExt = path.extname(file.originalname);
    const fileName = `task_image/${createTaskDto.taskId}${fileExt}`;

    // เรียกใช้ฟังก์ชันใหม่ uploadRobotFile
    const fullUrl = await this.storageService.uploadRobotFile(file, fileName);

        // 3. บันทึก Full URL ลง DB
        const task = this.tasksRepository.create({
            task_id: createTaskDto.taskId,
            task_name: createTaskDto.taskName,
            map_name: createTaskDto.mapName,
            mode: createTaskDto.mode,
            purpose: createTaskDto.purpose,
            siteName: createTaskDto.siteName,
            imageUrl: fullUrl, // บันทึกเป็น https://...
        });
        
        return this.tasksRepository.save(task);
    }

    async update(id: string, updateData: Partial<CreateTaskDto>, file?: Express.Multer.File) {
        const task = await this.findOne(id);

        if (file) {
            const fileExt = path.extname(file.originalname);
            const fileName = `task_image/${task.task_id}${fileExt}`;
            
            await this.storageService.uploadFile(file, fileName);

            // อัปเดต URL ใหม่ (เผื่อมีการเปลี่ยน config หรืออะไรก็ตาม)
            const endpoint = this.configService.get('MINIO_ENDPOINT');
            const bucket = this.configService.get('MINIO_BUCKET');
            task.imageUrl = `https://${endpoint}/${bucket}/${fileName}`;
        }

        if (updateData.taskName) task.task_name = updateData.taskName;
        if (updateData.mapName) task.map_name = updateData.mapName;
        if (updateData.mode) task.mode = updateData.mode;
        if (updateData.purpose) task.purpose = updateData.purpose;
        if (updateData.siteName) task.siteName = updateData.siteName;

        return this.tasksRepository.save(task);
    }

    async delete(id: string) {
        const task = await this.findOne(id);
        return this.tasksRepository.remove(task);
    }

    
}