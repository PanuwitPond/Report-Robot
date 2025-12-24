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
    UseGuards,Res, NotFoundException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Response } from 'express';

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

    @Get('image/:id')
async getTaskImage(@Param('id') id: string, @Res() res: Response) {
    const task = await this.tasksService.findOne(id);
    if (!task || !task.imageUrl) {
        throw new NotFoundException('Image not found');
    }

    // กรณีที่ imageUrl ใน DB เก็บเป็น ByteA (Binary) หรือ Path ที่ต้องดึงจาก DB
    // ให้ส่งข้อมูลออกไปเป็น Stream รูปภาพ
    res.setHeader('Content-Type', 'image/jpeg'); // หรือประเภทไฟล์ที่ถูกต้อง
    return res.send(task.imageUrl); 
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
