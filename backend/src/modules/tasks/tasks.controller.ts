import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UploadedFile,
    UseInterceptors,
    UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Get()
    async findAll(@Query('domain') domain: string) {
        return this.tasksService.findAll(domain);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.tasksService.findOne(id);
    }

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    async create(
        @Body() createTaskDto: CreateTaskDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.tasksService.create(createTaskDto, file);
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('image'))
    async update(
        @Param('id') id: string,
        @Body() updateData: Partial<CreateTaskDto>,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.tasksService.update(id, updateData, file);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.tasksService.delete(id);
        return { message: 'Task deleted successfully' };
    }
}
