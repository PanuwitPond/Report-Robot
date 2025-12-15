// Device Types
export interface DeviceResponseDto {
    id: string;
    name: string;
    description?: string;
    rtspUrl: string;
    status: 'active' | 'inactive' | 'disconnected';
    location?: string;
    cameraSettings?: {
        resolution?: string;
        fps?: number;
        bitrate?: string;
    };
    createdAt: Date;
    updatedAt: Date;
    domain: string;
    roiCount?: number;
    scheduleCount?: number;
}

export interface CreateDeviceDto {
    name: string;
    description?: string;
    rtspUrl: string;
    location?: string;
    cameraSettings?: {
        resolution?: string;
        fps?: number;
        bitrate?: string;
    };
}

export interface UpdateDeviceDto {
    name?: string;
    description?: string;
    rtspUrl?: string;
    status?: 'active' | 'inactive' | 'disconnected';
    location?: string;
    cameraSettings?: {
        resolution?: string;
        fps?: number;
        bitrate?: string;
    };
}

// ROI Types
export interface RoiResponseDto {
    id: string;
    name: string;
    type: 'intrusion' | 'tripwire' | 'density' | 'zoom';
    deviceId: string;
    coordinates: {
        points: Array<{ x: number; y: number }>;
        width?: number;
        height?: number;
    };
    isActive: boolean;
    settings?: {
        sensitivity?: number;
        threshold?: number;
        color?: string;
    };
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    domain: string;
}

export interface CreateRoiDto {
    name: string;
    type: 'intrusion' | 'tripwire' | 'density' | 'zoom';
    deviceId: string;
    coordinates: {
        points: Array<{ x: number; y: number }>;
        width?: number;
        height?: number;
    };
    description?: string;
    settings?: {
        sensitivity?: number;
        threshold?: number;
        color?: string;
    };
}

export interface UpdateRoiDto {
    name?: string;
    coordinates?: {
        points: Array<{ x: number; y: number }>;
        width?: number;
        height?: number;
    };
    settings?: {
        sensitivity?: number;
        threshold?: number;
        color?: string;
    };
    description?: string;
}

// Schedule Types
export interface ScheduleResponseDto {
    id: string;
    name: string;
    deviceId: string;
    timeRange: {
        startTime: string;
        endTime: string;
    };
    daysOfWeek: string[];
    isActive: boolean;
    description?: string;
    actions?: {
        enableROIs?: string[];
        disableROIs?: string[];
        recordVideo?: boolean;
        sendAlert?: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
    domain: string;
}

export interface CreateScheduleDto {
    name: string;
    deviceId: string;
    timeRange: {
        startTime: string;
        endTime: string;
    };
    daysOfWeek: string[];
    description?: string;
    actions?: {
        enableROIs?: string[];
        disableROIs?: string[];
        recordVideo?: boolean;
        sendAlert?: boolean;
    };
}

export interface UpdateScheduleDto {
    name?: string;
    timeRange?: {
        startTime: string;
        endTime: string;
    };
    daysOfWeek?: string[];
    isActive?: boolean;
    description?: string;
    actions?: {
        enableROIs?: string[];
        disableROIs?: string[];
        recordVideo?: boolean;
        sendAlert?: boolean;
    };
}
