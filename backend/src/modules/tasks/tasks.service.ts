import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { StorageService } from '../../storage/storage.service';
import * as path from 'path'; // Fix for path error

@Injectable()
export class TasksService {
    constructor(
       @InjectRepository(Task, 'ROBOT_CONNECTION')
        private readonly tasksRepository: Repository<Task>,
        private readonly storageService: StorageService,
    ) { }

    async findAll(domain: string) {
    const tasks = await this.tasksRepository.find();
    return tasks.map(task => ({
        ...task,
        // แปลง path ใน DB ให้เป็น URL ที่ผ่าน API ของเรา
        imageUrl: task.imageUrl ? `/api/storage/url?path=${task.imageUrl}` : null 
    }));
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
    
    // อัปโหลดไฟล์ไปที่ MinIO
    await this.storageService.uploadFile(file, fileName);

    const task = this.tasksRepository.create({
        ...createTaskDto,
        task_id: createTaskDto.taskId,
        imageUrl: fileName, // บันทึก path ลงในตาราง ml_robot_tasks
    });
    return this.tasksRepository.save(task);
}

    async update(id: string, updateData: Partial<CreateTaskDto>, file?: Express.Multer.File) {
        const task = await this.findOne(id); // ค้นหา task เดิมด้วย task_id

        if (file) {
            const fileExt = path.extname(file.originalname);
            // ใช้ id (task_id) เดิมในการตั้งชื่อไฟล์เพื่อเขียนทับรูปเก่าใน storage
            const fileName = `task_image/${task.task_id}${fileExt}`;
            task.imageUrl = await this.storageService.uploadFile(file, fileName);
        }

        // อัปเดตข้อมูลฟิลด์ต่างๆ จาก updateData (DTO) ลงใน Entity
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