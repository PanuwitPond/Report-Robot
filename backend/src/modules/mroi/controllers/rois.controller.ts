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
import { RoisService } from '../services/rois.service';
import { CreateRoiDto, UpdateRoiDto, RoiResponseDto } from '../dtos';

@Controller('api/mroi/rois')
@UseGuards(AuthGuard('jwt'))
export class RoisController {
    constructor(private readonly roisService: RoisService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createRoiDto: CreateRoiDto, @Req() req: any): Promise<RoiResponseDto> {
        return this.roisService.create(createRoiDto, req.user.sub, req.user.domain);
    }

    @Get()
    async findAll(@Req() req: any, @Query('deviceId') deviceId?: string): Promise<RoiResponseDto[]> {
        if (deviceId) {
            return this.roisService.findAllByDevice(deviceId, req.user.domain);
        }
        return this.roisService.findAll(req.user.domain);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Req() req: any): Promise<RoiResponseDto> {
        return this.roisService.findById(id, req.user.domain);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateRoiDto: UpdateRoiDto,
        @Req() req: any,
    ): Promise<RoiResponseDto> {
        return this.roisService.update(id, updateRoiDto, req.user.domain);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string, @Req() req: any): Promise<void> {
        return this.roisService.delete(id, req.user.domain);
    }

    @Put(':id/toggle')
    async toggleActive(@Param('id') id: string, @Req() req: any): Promise<RoiResponseDto> {
        return this.roisService.toggleActive(id, req.user.domain);
    }
}
