import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SchedulesService } from '../services/schedules.service';
import { CreateScheduleDto, UpdateScheduleDto, ScheduleResponseDto } from '../dtos';

@Controller('mroi/schedules')
@UseGuards(AuthGuard('jwt'))
export class SchedulesController {
    constructor(private readonly schedulesService: SchedulesService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createScheduleDto: CreateScheduleDto, @Req() req: any): Promise<ScheduleResponseDto> {
        return this.schedulesService.create(createScheduleDto, req.user.sub, req.user.domain);
    }

    @Get()
    async findAll(@Req() req: any, @Query('deviceId') deviceId?: string): Promise<ScheduleResponseDto[]> {
        if (deviceId) {
            return this.schedulesService.findAllByDevice(deviceId, req.user.domain);
        }
        return this.schedulesService.findAll(req.user.domain);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Req() req: any): Promise<ScheduleResponseDto> {
        return this.schedulesService.findById(id, req.user.domain);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateScheduleDto: UpdateScheduleDto,
        @Req() req: any,
    ): Promise<ScheduleResponseDto> {
        return this.schedulesService.update(id, updateScheduleDto, req.user.domain);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string, @Req() req: any): Promise<void> {
        return this.schedulesService.delete(id, req.user.domain);
    }

    @Put(':id/toggle')
    async toggleActive(@Param('id') id: string, @Req() req: any): Promise<ScheduleResponseDto> {
        return this.schedulesService.toggleActive(id, req.user.domain);
    }
}
