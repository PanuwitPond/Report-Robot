import { apiClient } from './api.client';
import {
    DeviceResponseDto,
    CreateDeviceDto,
    UpdateDeviceDto,
    RoiResponseDto,
    CreateRoiDto,
    UpdateRoiDto,
    ScheduleResponseDto,
    CreateScheduleDto,
    UpdateScheduleDto,
} from '@/types';

// ============== DEVICES ==============
export const fetchDevices = async (): Promise<DeviceResponseDto[]> => {
    const response = await apiClient.get('/mroi/devices');
    return response.data;
};

export const fetchDeviceById = async (id: string): Promise<DeviceResponseDto> => {
    const response = await apiClient.get(`/mroi/devices/${id}`);
    return response.data;
};

export const createDevice = async (data: CreateDeviceDto): Promise<DeviceResponseDto> => {
    const response = await apiClient.post('/mroi/devices', data);
    return response.data;
};

export const updateDevice = async (id: string, data: UpdateDeviceDto): Promise<DeviceResponseDto> => {
    const response = await apiClient.put(`/mroi/devices/${id}`, data);
    return response.data;
};

export const deleteDevice = async (id: string): Promise<void> => {
    await apiClient.delete(`/mroi/devices/${id}`);
};

export const getDeviceStatus = async (id: string) => {
    const response = await apiClient.get(`/mroi/devices/${id}/status`);
    return response.data;
};

// ============== ROIs ==============
export const fetchRois = async (deviceId?: string): Promise<RoiResponseDto[]> => {
    const params = deviceId ? { deviceId } : {};
    const response = await apiClient.get('/mroi/rois', { params });
    return response.data;
};

export const fetchRoiById = async (id: string): Promise<RoiResponseDto> => {
    const response = await apiClient.get(`/mroi/rois/${id}`);
    return response.data;
};

export const createRoi = async (data: CreateRoiDto): Promise<RoiResponseDto> => {
    const response = await apiClient.post('/mroi/rois', data);
    return response.data;
};

export const updateRoi = async (id: string, data: UpdateRoiDto): Promise<RoiResponseDto> => {
    const response = await apiClient.put(`/mroi/rois/${id}`, data);
    return response.data;
};

export const deleteRoi = async (id: string): Promise<void> => {
    await apiClient.delete(`/mroi/rois/${id}`);
};

export const toggleRoiActive = async (id: string): Promise<RoiResponseDto> => {
    const response = await apiClient.put(`/mroi/rois/${id}/toggle`);
    return response.data;
};

// ============== SCHEDULES ==============
export const fetchSchedules = async (deviceId?: string): Promise<ScheduleResponseDto[]> => {
    const params = deviceId ? { deviceId } : {};
    const response = await apiClient.get('/mroi/schedules', { params });
    return response.data;
};

export const fetchScheduleById = async (id: string): Promise<ScheduleResponseDto> => {
    const response = await apiClient.get(`/mroi/schedules/${id}`);
    return response.data;
};

export const createSchedule = async (data: CreateScheduleDto): Promise<ScheduleResponseDto> => {
    const response = await apiClient.post('/mroi/schedules', data);
    return response.data;
};

export const updateSchedule = async (id: string, data: UpdateScheduleDto): Promise<ScheduleResponseDto> => {
    const response = await apiClient.put(`/mroi/schedules/${id}`, data);
    return response.data;
};

export const deleteSchedule = async (id: string): Promise<void> => {
    await apiClient.delete(`/mroi/schedules/${id}`);
};

export const toggleScheduleActive = async (id: string): Promise<ScheduleResponseDto> => {
    const response = await apiClient.put(`/mroi/schedules/${id}/toggle`);
    return response.data;
};
