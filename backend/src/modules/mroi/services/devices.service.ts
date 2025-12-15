import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceEntity } from '../entities/device.entity';
import { CreateDeviceDto, UpdateDeviceDto, DeviceResponseDto } from '../dtos';

@Injectable()
export class DevicesService {
    constructor(
        @InjectRepository(DeviceEntity)
        private deviceRepository: Repository<DeviceEntity>,
    ) {}

    async create(createDeviceDto: CreateDeviceDto, userId: string, domain: string): Promise<DeviceResponseDto> {
        // ตรวจสอบว่าชื่อ device ซ้ำกันหรือไม่
        const existingDevice = await this.deviceRepository.findOne({
            where: { name: createDeviceDto.name, domain },
        });

        if (existingDevice) {
            throw new BadRequestException(`Device with name "${createDeviceDto.name}" already exists`);
        }

        const device = this.deviceRepository.create({
            ...createDeviceDto,
            createdBy: userId,
            domain,
        });

        await this.deviceRepository.save(device);

        return this.mapToResponseDto(device);
    }

    async findAll(domain: string): Promise<DeviceResponseDto[]> {
        const devices = await this.deviceRepository
            .createQueryBuilder('device')
            .leftJoinAndSelect('device.rois', 'rois')
            .leftJoinAndSelect('device.schedules', 'schedules')
            .where('device.domain = :domain', { domain })
            .orderBy('device.createdAt', 'DESC')
            .getMany();

        return devices.map((device) =>
            this.mapToResponseDto(device, device.rois?.length || 0, device.schedules?.length || 0),
        );
    }

    async findById(id: string, domain: string): Promise<DeviceResponseDto> {
        const device = await this.deviceRepository
            .createQueryBuilder('device')
            .leftJoinAndSelect('device.rois', 'rois')
            .leftJoinAndSelect('device.schedules', 'schedules')
            .where('device.id = :id', { id })
            .andWhere('device.domain = :domain', { domain })
            .getOne();

        if (!device) {
            throw new NotFoundException(`Device with id "${id}" not found`);
        }

        return this.mapToResponseDto(device, device.rois?.length || 0, device.schedules?.length || 0);
    }

    async update(id: string, updateDeviceDto: UpdateDeviceDto, domain: string): Promise<DeviceResponseDto> {
        const device = await this.deviceRepository.findOne({
            where: { id, domain },
        });

        if (!device) {
            throw new NotFoundException(`Device with id "${id}" not found`);
        }

        // ตรวจสอบความซ้ำของชื่อ (ถ้ามีการเปลี่ยนชื่อ)
        if (updateDeviceDto.name && updateDeviceDto.name !== device.name) {
            const existingDevice = await this.deviceRepository.findOne({
                where: { name: updateDeviceDto.name, domain },
            });

            if (existingDevice) {
                throw new BadRequestException(`Device with name "${updateDeviceDto.name}" already exists`);
            }
        }

        Object.assign(device, updateDeviceDto);
        await this.deviceRepository.save(device);

        return this.mapToResponseDto(device);
    }

    async delete(id: string, domain: string): Promise<void> {
        const device = await this.deviceRepository.findOne({
            where: { id, domain },
        });

        if (!device) {
            throw new NotFoundException(`Device with id "${id}" not found`);
        }

        await this.deviceRepository.remove(device);
    }

    async getDeviceStatus(id: string, domain: string): Promise<{ status: string; lastUpdate: Date }> {
        const device = await this.deviceRepository.findOne({
            where: { id, domain },
            select: ['id', 'status', 'updatedAt'],
        });

        if (!device) {
            throw new NotFoundException(`Device with id "${id}" not found`);
        }

        return {
            status: device.status,
            lastUpdate: device.updatedAt,
        };
    }

    private mapToResponseDto(
        device: DeviceEntity,
        roiCount?: number,
        scheduleCount?: number,
    ): DeviceResponseDto {
        return {
            id: device.id,
            name: device.name,
            description: device.description,
            rtspUrl: device.rtspUrl,
            status: device.status,
            location: device.location,
            cameraSettings: device.cameraSettings,
            createdAt: device.createdAt,
            updatedAt: device.updatedAt,
            domain: device.domain,
            roiCount,
            scheduleCount,
        };
    }
}
