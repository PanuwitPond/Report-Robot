import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { StorageService } from '@/storage/storage.service';
export declare class TasksService {
    private tasksRepository;
    private storageService;
    constructor(tasksRepository: Repository<Task>, storageService: StorageService);
    findAll(domain: string): Promise<Task[]>;
    findOne(id: string): Promise<Task>;
    create(createTaskDto: CreateTaskDto, file?: Express.Multer.File): Promise<Task>;
    update(id: string, updateData: Partial<CreateTaskDto>, file?: Express.Multer.File): Promise<Task>;
    delete(id: string): Promise<void>;
}
