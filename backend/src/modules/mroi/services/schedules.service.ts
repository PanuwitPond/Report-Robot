import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ScheduleEntity } from '../entities/schedule.entity';
import { DeviceEntity } from '../entities/device.entity';
import { CreateScheduleDto, UpdateScheduleDto, ScheduleResponseDto } from '../dtos';

@Injectable()
export class SchedulesService {
    constructor(
        @InjectRepository(ScheduleEntity)
        private scheduleRepository: Repository<ScheduleEntity>,
        @InjectRepository(DeviceEntity)
        private deviceRepository: Repository<DeviceEntity>,
    ) {}

    async create(createScheduleDto: CreateScheduleDto, userId: string, domain: string): Promise<ScheduleResponseDto> {
        // ตรวจสอบว่า device มีอยู่หรือไม่
        const device = await this.deviceRepository.findOne({
            where: { id: createScheduleDto.deviceId, domain },
        });

        if (!device) {
            throw new NotFoundException(`Device with id "${createScheduleDto.deviceId}" not found`);
        }

        // ตรวจสอบความถูกต้องของ time range
        if (!this.isValidTimeRange(createScheduleDto.timeRange)) {
            throw new BadRequestException('Invalid time range');
        }

        const schedule = this.scheduleRepository.create({
            ...createScheduleDto,
            createdBy: userId,
            domain,
        });

        await this.scheduleRepository.save(schedule);

        return this.mapToResponseDto(schedule);
    }

    async findAllByDevice(deviceId: string, domain: string): Promise<ScheduleResponseDto[]> {
        const schedules = await this.scheduleRepository.find({
            where: { deviceId, domain },
            order: { createdAt: 'DESC' },
        });

        return schedules.map((schedule) => this.mapToResponseDto(schedule));
    }

    async findAll(domain: string): Promise<ScheduleResponseDto[]> {
        const schedules = await this.scheduleRepository.find({
            where: { domain },
            order: { createdAt: 'DESC' },
        });

        return schedules.map((schedule) => this.mapToResponseDto(schedule));
    }

    async findById(id: string, domain: string): Promise<ScheduleResponseDto> {
        const schedule = await this.scheduleRepository.findOne({
            where: { id, domain },
        });

        if (!schedule) {
            throw new NotFoundException(`Schedule with id "${id}" not found`);
        }

        return this.mapToResponseDto(schedule);
    }

    async update(id: string, updateScheduleDto: UpdateScheduleDto, domain: string): Promise<ScheduleResponseDto> {
        const schedule = await this.scheduleRepository.findOne({
            where: { id, domain },
        });

        if (!schedule) {
            throw new NotFoundException(`Schedule with id "${id}" not found`);
        }

        // ตรวจสอบ time range ถ้ามีการเปลี่ยน
        if (updateScheduleDto.timeRange && !this.isValidTimeRange(updateScheduleDto.timeRange)) {
            throw new BadRequestException('Invalid time range');
        }

        Object.assign(schedule, updateScheduleDto);
        await this.scheduleRepository.save(schedule);

        return this.mapToResponseDto(schedule);
    }

    async delete(id: string, domain: string): Promise<void> {
        const schedule = await this.scheduleRepository.findOne({
            where: { id, domain },
        });

        if (!schedule) {
            throw new NotFoundException(`Schedule with id "${id}" not found`);
        }

        await this.scheduleRepository.remove(schedule);
    }

    async toggleActive(id: string, domain: string): Promise<ScheduleResponseDto> {
        const schedule = await this.scheduleRepository.findOne({
            where: { id, domain },
        });

        if (!schedule) {
            throw new NotFoundException(`Schedule with id "${id}" not found`);
        }

        schedule.isActive = !schedule.isActive;
        await this.scheduleRepository.save(schedule);

        return this.mapToResponseDto(schedule);
    }

    async deleteByDevice(deviceId: string, domain: string): Promise<void> {
        await this.scheduleRepository.delete({
            deviceId,
            domain,
        });
    }

    private isValidTimeRange(timeRange: { startTime: string; endTime: string }): boolean {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

        if (!timeRegex.test(timeRange.startTime) || !timeRegex.test(timeRange.endTime)) {
            return false;
        }

        const [startHour, startMin] = timeRange.startTime.split(':').map(Number);
        const [endHour, endMin] = timeRange.endTime.split(':').map(Number);

        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;

        return startTime < endTime;
    }

    private mapToResponseDto(schedule: ScheduleEntity): ScheduleResponseDto {
        return {
            id: schedule.id,
            name: schedule.name,
            deviceId: schedule.deviceId,
            timeRange: schedule.timeRange,
            daysOfWeek: schedule.daysOfWeek,
            isActive: schedule.isActive,
            description: schedule.description,
            actions: schedule.actions,
            createdBy: schedule.createdBy,
            createdAt: schedule.createdAt,
            updatedAt: schedule.updatedAt,
            domain: schedule.domain,
        };
    }
}
