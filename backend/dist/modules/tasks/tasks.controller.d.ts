import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    findAll(domain: string): Promise<import("./entities/task.entity").Task[]>;
    findOne(id: string): Promise<import("./entities/task.entity").Task>;
    create(createTaskDto: CreateTaskDto, file: Express.Multer.File): Promise<import("./entities/task.entity").Task>;
    update(id: string, updateData: Partial<CreateTaskDto>, file: Express.Multer.File): Promise<import("./entities/task.entity").Task>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
