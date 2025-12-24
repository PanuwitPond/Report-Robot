import { Injectable, BadRequestException, NotFoundException, Inject, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceEntity } from '../entities/device.entity';
import { CreateDeviceDto, UpdateDeviceDto, DeviceResponseDto } from '../dtos';
import { IvCamerasService } from './iv-cameras.service';

@Injectable()
export class DevicesService {
    private readonly logger = new Logger(DevicesService.name);
    private cameraCache: any[] = [];
    private cacheTimestamp = 0;
    private readonly CACHE_TTL = 30000; // 30 seconds cache

    constructor(
        @InjectRepository(DeviceEntity)
        private deviceRepository: Repository<DeviceEntity>,
        private readonly ivCamerasService: IvCamerasService,
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

    private async getCachedExternalCameras(): Promise<any[]> {
        const now = Date.now();
        // Return cached data if still valid
        if (this.cameraCache.length > 0 && (now - this.cacheTimestamp) < this.CACHE_TTL) {
            this.logger.debug('Using cached camera data');
            return this.cameraCache;
        }

        // Fetch fresh data
        this.logger.debug('Fetching fresh camera data from external database');
        const cameras = await this.ivCamerasService.getAllCamerasFromAllSchemas();
        this.cameraCache = cameras;
        this.cacheTimestamp = now;
        return cameras;
    }

    async findAll(domain: string): Promise<DeviceResponseDto[]> {
        try {
            // Fetch from external database (192.168.100.83) with cache
            const externalCameras = await this.getCachedExternalCameras();

            // Transform external cameras to DeviceResponseDto
            const externalDevices = externalCameras.map((camera: any) => ({
                id: camera.iv_camera_uuid || camera.device_id,
                name: camera.camera_name_display || camera.camera_name,
                description: `Camera at ${camera.camera_site}`,
                rtspUrl: camera.rtsp,
                status: 'online',
                location: camera.camera_site,
                cameraSettings: {
                    cameraType: camera.camera_type,
                    metthierAiConfig: camera.metthier_ai_config,
                },
                createdBy: 'system',
                domain: domain,
                roiCount: 0,
                scheduleCount: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                isExternal: true,  // ← Flag indicating external device
                readOnly: true,    // ← Flag indicating read-only
            } as DeviceResponseDto));

            // Also fetch local devices
            const localDevices = await this.deviceRepository
                .createQueryBuilder('device')
                .leftJoinAndSelect('device.rois', 'rois')
                .leftJoinAndSelect('device.schedules', 'schedules')
                .where('device.domain = :domain', { domain })
                .orderBy('device.createdAt', 'DESC')
                .getMany();

            const localDevicesDto = localDevices.map((device) =>
                this.mapToResponseDto(device, device.rois?.length || 0, device.schedules?.length || 0),
            );

            // Combine and deduplicate by ID
            const combined = [...externalDevices, ...localDevicesDto];
            const uniqueDevices = Array.from(
                new Map(combined.map(device => [device.id, device])).values()
            );

            return uniqueDevices;
        } catch (error) {
            this.logger.error('Error fetching devices from external database', error);
            // Fallback to local devices only if external fails
            return this.findAllLocal(domain);
        }
    }

    async findAllLocal(domain: string): Promise<DeviceResponseDto[]> {
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
        try {
            // ค้นหาจาก external database ก่อน (with cache)
            const externalCameras = await this.getCachedExternalCameras();
            const externalCamera = externalCameras.find(
                (cam: any) => cam.iv_camera_uuid === id || cam.device_id === id
            );

            if (externalCamera) {
                return {
                    id: externalCamera.iv_camera_uuid || externalCamera.device_id,
                    name: externalCamera.camera_name_display || externalCamera.camera_name,
                    description: `Camera at ${externalCamera.camera_site}`,
                    rtspUrl: externalCamera.rtsp,
                    status: 'online',
                    location: externalCamera.camera_site,
                    cameraSettings: {
                        cameraType: externalCamera.camera_type,
                        metthierAiConfig: externalCamera.metthier_ai_config,
                    },
                    createdBy: 'system',
                    domain: domain,
                    roiCount: 0,
                    scheduleCount: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isExternal: true,  // ← Flag indicating external device
                    readOnly: true,    // ← Flag indicating read-only
                } as DeviceResponseDto;
            }

            // ถ้าไม่หา จาก external ให้หา local
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
        } catch (error) {
            // ✅ IMPROVED: Re-throw NotFoundException properly
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`Error fetching device ${id}`, error);
            throw new NotFoundException(`Device with id "${id}" not found`);
        }
    }

    async update(id: string, updateDeviceDto: UpdateDeviceDto, domain: string): Promise<DeviceResponseDto> {
        // First check if device exists in local database
        const device = await this.deviceRepository.findOne({
            where: { id, domain },
        });

        // If device not found locally, check if it's an external device
        if (!device) {
            // Check if it's an external device (trying to update)
            const externalCameras = await this.getCachedExternalCameras();
            const isExternal = externalCameras.some(
                (cam: any) => cam.iv_camera_uuid === id || cam.device_id === id
            );
            
            if (isExternal) {
                throw new BadRequestException(
                    'Cannot update device managed externally. Please use the external system to modify this device.'
                );
            }
            
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
            createdBy: device.createdBy,
            createdAt: device.createdAt,
            updatedAt: device.updatedAt,
            domain: device.domain,
            roiCount,
            scheduleCount,
        };
    }
}
