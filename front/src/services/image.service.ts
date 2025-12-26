import { apiClient } from './api.client';
import type { RobotImage, UploadImageDTO, UpdateImageDTO } from '@/types';

export const imageService = {
    async getAll(domain: string): Promise<RobotImage[]> {
        const { data } = await apiClient.get<RobotImage[]>('/images', {
            params: { domain },
        });
        return data;
    },

    // [เพิ่มใหม่] ฟังก์ชันดึง Site จาก Database (เหมือน robot-web)
    async getSites(): Promise<string[]> {
        const { data } = await apiClient.get<{ sites: string[] }>('/reports/robot-sites');
        return data.sites;
    },

  async upload(data: UploadImageDTO, domain: string): Promise<RobotImage> {
        const formData = new FormData();
        formData.append('site', data.site);
        formData.append('imageType', data.imageType);
        formData.append('imageName', data.imageName);
        formData.append('image', data.image);
        formData.append('domain', domain);

        // [แก้ไขจุดที่ผิด] เปลี่ยนจาก { response } เป็น { data }
        const { data: result } = await apiClient.post<RobotImage>('/images', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return result;
    },

    async update(data: UpdateImageDTO): Promise<RobotImage> {
        const formData = new FormData();
        if (data.site) formData.append('site', data.site);
        if (data.imageType) formData.append('imageType', data.imageType);
        if (data.image) formData.append('image', data.image);

        // [แก้ไขจุดที่ผิด] เปลี่ยนจาก { response } เป็น { data } เช่นกัน
        const { data: result } = await apiClient.patch<RobotImage>(`/images/${data.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return result;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/images/${id}`);
    }
    
};