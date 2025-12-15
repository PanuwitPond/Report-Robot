import { IsString, IsOptional, IsUUID, IsObject, IsEnum } from 'class-validator';

export class CreateDeviceDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    rtspUrl: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsObject()
    cameraSettings?: {
        resolution?: string;
        fps?: number;
        bitrate?: string;
    };
}

export class UpdateDeviceDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    rtspUrl?: string;

    @IsOptional()
    @IsEnum(['active', 'inactive', 'disconnected'])
    status?: 'active' | 'inactive' | 'disconnected';

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsObject()
    cameraSettings?: {
        resolution?: string;
        fps?: number;
        bitrate?: string;
    };
}

export class DeviceResponseDto {
    id: string;
    name: string;
    description?: string;
    rtspUrl: string;
    status: string;
    location?: string;
    cameraSettings?: any;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    domain: string;
    roiCount?: number;
    scheduleCount?: number;
}
