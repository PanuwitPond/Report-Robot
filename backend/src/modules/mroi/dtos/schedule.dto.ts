import { IsString, IsOptional, IsUUID, IsObject, IsArray, IsBoolean } from 'class-validator';

export class CreateScheduleDto {
    @IsString()
    name: string;

    @IsUUID()
    deviceId: string;

    @IsObject()
    timeRange: {
        startTime: string; // HH:mm
        endTime: string; // HH:mm
    };

    @IsArray()
    daysOfWeek: string[]; // ['MON', 'TUE', ...]

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsObject()
    actions?: {
        enableROIs?: string[];
        disableROIs?: string[];
        recordVideo?: boolean;
        sendAlert?: boolean;
    };
}

export class UpdateScheduleDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsObject()
    timeRange?: {
        startTime: string;
        endTime: string;
    };

    @IsOptional()
    @IsArray()
    daysOfWeek?: string[];

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsObject()
    actions?: {
        enableROIs?: string[];
        disableROIs?: string[];
        recordVideo?: boolean;
        sendAlert?: boolean;
    };
}

export class ScheduleResponseDto {
    id: string;
    name: string;
    deviceId: string;
    timeRange: any;
    daysOfWeek: string[];
    isActive: boolean;
    description?: string;
    actions?: any;
    createdAt: Date;
    updatedAt: Date;
    domain: string;
}
