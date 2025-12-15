import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DevicesService } from '../services/devices.service';
import { CreateDeviceDto, UpdateDeviceDto, DeviceResponseDto } from '../dtos';

@Controller('api/mroi/devices')
@UseGuards(AuthGuard('jwt'))
export class DevicesController {
    constructor(private readonly devicesService: DevicesService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createDeviceDto: CreateDeviceDto, @Req() req: any): Promise<DeviceResponseDto> {
        return this.devicesService.create(createDeviceDto, req.user.sub, req.user.domain);
    }

    @Get()
    async findAll(@Req() req: any): Promise<DeviceResponseDto[]> {
        return this.devicesService.findAll(req.user.domain);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Req() req: any): Promise<DeviceResponseDto> {
        return this.devicesService.findById(id, req.user.domain);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateDeviceDto: UpdateDeviceDto,
        @Req() req: any,
    ): Promise<DeviceResponseDto> {
        return this.devicesService.update(id, updateDeviceDto, req.user.domain);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string, @Req() req: any): Promise<void> {
        return this.devicesService.delete(id, req.user.domain);
    }

    @Get(':id/status')
    async getStatus(@Param('id') id: string, @Req() req: any) {
        return this.devicesService.getDeviceStatus(id, req.user.domain);
    }
}
