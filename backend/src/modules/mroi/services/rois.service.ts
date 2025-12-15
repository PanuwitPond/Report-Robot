import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RoiEntity } from '../entities/roi.entity';
import { DeviceEntity } from '../entities/device.entity';
import { CreateRoiDto, UpdateRoiDto, RoiResponseDto } from '../dtos';

@Injectable()
export class RoisService {
    constructor(
        @InjectRepository(RoiEntity)
        private roiRepository: Repository<RoiEntity>,
        @InjectRepository(DeviceEntity)
        private deviceRepository: Repository<DeviceEntity>,
    ) {}

    async create(createRoiDto: CreateRoiDto, userId: string, domain: string): Promise<RoiResponseDto> {
        // ตรวจสอบว่า device มีอยู่หรือไม่
        const device = await this.deviceRepository.findOne({
            where: { id: createRoiDto.deviceId, domain },
        });

        if (!device) {
            throw new NotFoundException(`Device with id "${createRoiDto.deviceId}" not found`);
        }

        const roi = this.roiRepository.create({
            ...createRoiDto,
            createdBy: userId,
            domain,
        });

        await this.roiRepository.save(roi);

        return this.mapToResponseDto(roi);
    }

    async findAllByDevice(deviceId: string, domain: string): Promise<RoiResponseDto[]> {
        const rois = await this.roiRepository.find({
            where: { deviceId, domain },
            order: { createdAt: 'DESC' },
        });

        return rois.map((roi) => this.mapToResponseDto(roi));
    }

    async findAll(domain: string): Promise<RoiResponseDto[]> {
        const rois = await this.roiRepository.find({
            where: { domain },
            order: { createdAt: 'DESC' },
        });

        return rois.map((roi) => this.mapToResponseDto(roi));
    }

    async findById(id: string, domain: string): Promise<RoiResponseDto> {
        const roi = await this.roiRepository.findOne({
            where: { id, domain },
        });

        if (!roi) {
            throw new NotFoundException(`ROI with id "${id}" not found`);
        }

        return this.mapToResponseDto(roi);
    }

    async update(id: string, updateRoiDto: UpdateRoiDto, domain: string): Promise<RoiResponseDto> {
        const roi = await this.roiRepository.findOne({
            where: { id, domain },
        });

        if (!roi) {
            throw new NotFoundException(`ROI with id "${id}" not found`);
        }

        Object.assign(roi, updateRoiDto);
        await this.roiRepository.save(roi);

        return this.mapToResponseDto(roi);
    }

    async delete(id: string, domain: string): Promise<void> {
        const roi = await this.roiRepository.findOne({
            where: { id, domain },
        });

        if (!roi) {
            throw new NotFoundException(`ROI with id "${id}" not found`);
        }

        await this.roiRepository.remove(roi);
    }

    async toggleActive(id: string, domain: string): Promise<RoiResponseDto> {
        const roi = await this.roiRepository.findOne({
            where: { id, domain },
        });

        if (!roi) {
            throw new NotFoundException(`ROI with id "${id}" not found`);
        }

        roi.isActive = !roi.isActive;
        await this.roiRepository.save(roi);

        return this.mapToResponseDto(roi);
    }

    async deleteByDevice(deviceId: string, domain: string): Promise<void> {
        await this.roiRepository.delete({
            deviceId,
            domain,
        });
    }

    private mapToResponseDto(roi: RoiEntity): RoiResponseDto {
        return {
            id: roi.id,
            name: roi.name,
            type: roi.type,
            deviceId: roi.deviceId,
            coordinates: roi.coordinates,
            isActive: roi.isActive,
            settings: roi.settings,
            description: roi.description,
            createdBy: roi.createdBy,
            createdAt: roi.createdAt,
            updatedAt: roi.updatedAt,
            domain: roi.domain,
        };
    }
}
