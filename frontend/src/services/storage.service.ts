import { apiClient } from './api.client';

export interface MinioFile {
    name: string;
    lastModified: string;
    etag: string;
    size: number;
}

export interface StorageListResponse {
    count: number;
    files: MinioFile[];
}

export const storageService = {
    // ดึงรายชื่อไฟล์ทั้งหมด (เราจะเอามาจัด Group เป็น Folder ที่หน้าบ้าน)
    async listFiles(prefix: string = ''): Promise<StorageListResponse> {
        const { data } = await apiClient.get<StorageListResponse>('/storage/list', {
            params: { folder: prefix }, // ถ้า backend รองรับ recursive ให้ดึงมาทั้งหมดทีเดียวจะจัดการง่ายกว่า
        });
        return data;
    },

    // ขอ URL สำหรับดาวน์โหลด/แสดงผล
    async getFileUrl(path: string): Promise<string> {
        const { data } = await apiClient.get<{ url: string }>('/storage/url', {
            params: { path },
        });
        return data.url;
    }
};