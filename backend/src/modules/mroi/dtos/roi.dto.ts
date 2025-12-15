import { IsString, IsOptional, IsUUID, IsObject, IsEnum, IsArray } from 'class-validator';

export class CreateRoiDto {
    @IsString()
    name: string;

    @IsEnum(['intrusion', 'tripwire', 'density', 'zoom'])
    type: 'intrusion' | 'tripwire' | 'density' | 'zoom';

    @IsUUID()
    deviceId: string;

    @IsObject()
    coordinates: {
        points: Array<{ x: number; y: number }>;
        width?: number;
        height?: number;
    };

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsObject()
    settings?: {
        sensitivity?: number;
        threshold?: number;
        color?: string;
    };
}

export class UpdateRoiDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsObject()
    coordinates?: {
        points: Array<{ x: number; y: number }>;
        width?: number;
        height?: number;
    };

    @IsOptional()
    settings?: {
        sensitivity?: number;
        threshold?: number;
        color?: string;
    };

    @IsOptional()
    @IsString()
    description?: string;
}

export class RoiResponseDto {
    id: string;
    name: string;
    type: string;
    deviceId: string;
    coordinates: any;
    isActive: boolean;
    settings?: any;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    domain: string;
}
