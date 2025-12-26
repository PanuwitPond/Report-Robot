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
// ============== IV CAMERAS (Legacy/Multi-ROI) ==============
export const fetchIvSchemas = async (): Promise<string[]> => {
    // API ใหม่: /mroi/iv-cameras/schemas
    const response = await apiClient.get('/mroi/iv-cameras/schemas');
    return response.data;
};

export const fetchAllIvCameras = async (): Promise<any[]> => {
    // API ใหม่: /mroi/iv-cameras/cameras/all
    const response = await apiClient.get('/mroi/iv-cameras/cameras/all');
    return response.data;
};

export const fetchIvRoiData = async (schema: string, key: string): Promise<any> => {
    // API ใหม่: /mroi/iv-cameras/fetch/roi/data?schema=...&key=...
    const response = await apiClient.get('/mroi/iv-cameras/fetch/roi/data', { 
        params: { schema, key } 
    });
    return response.data;
};

export const fetchIvCamerasBySchema = async (schema: string): Promise<any[]> => {
    // API ใหม่: /mroi/iv-cameras/schemas/:schema
    const response = await apiClient.get(`/mroi/iv-cameras/schemas/${schema}`);
    return response.data;
};

export const fetchIvCameras = async (schema: string = 'metthier'): Promise<any[]> => {
    // Path นี้จะไปเรียก IvCamerasController ใน NestJS ที่เชื่อมกับ DB 192.168.100.83
    const response = await apiClient.get(`/mroi/iv-cameras/schemas/${schema}`);
    
    // ปรับโครงสร้างข้อมูลให้เข้ากับ DeviceResponseDto ที่หน้า UI คาดหวัง
    return response.data.map((cam: any) => ({
        id: cam.iv_camera_uuid,
        name: cam.camera_name_display || cam.camera_name,
        rtspUrl: cam.rtsp,
        status: 'active', // หรือ logic อื่นๆ
        location: cam.camera_site,
        description: cam.camera_type,
        roiCount: cam.metthier_ai_config?.rule?.length || 0,
        createdAt: new Date().toISOString(), // DB ภายนอกอาจไม่มีฟิลด์นี้ ให้ใส่ค่าจำลองไว้
    }));
};

export const updateIvRegionConfig = async (customer: string, cameraId: string, rule: any[]): Promise<any> => {
    // API ใหม่: /mroi/iv-cameras/save-region-config
    const response = await apiClient.post('/mroi/iv-cameras/save-region-config', 
        { rule }, 
        { params: { customer, cameraId } }
    );
    return response.data;
};

// สำหรับ Snapshot เนื่องจากเป็น Image Stream อาจจะเรียกผ่าน URL โดยตรงใน <img src="..."> 
// หรือใช้ function นี้ถ้าต้องการ blob
export const getSnapshotUrl = (rtsp: string) => {
    // ใช้ base url จาก apiClient หรือ constants
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    return `${baseUrl}/mroi/iv-cameras/snapshot?rtsp=${encodeURIComponent(rtsp)}`;
};
