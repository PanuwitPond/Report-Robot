import { apiClient } from './api.client';
import type { Report, ReportFilters } from '@/types';

export const reportService = {
    async getAll(domain: string, filters?: ReportFilters): Promise<Report[]> {
        const { data } = await apiClient.get<Report[]>('/reports', {
            params: { domain, ...filters },
        });
        return data;
    },

    async getById(id: string): Promise<Report> {
        const { data } = await apiClient.get<Report>(`/reports/${id}`);
        return data;
    },

    async download(id: string): Promise<Blob> {
        const { data } = await apiClient.get(`/reports/${id}/download`, {
            responseType: 'blob',
        });
        return data;
    },

    async getFileUrl(fileUrl: string): Promise<string> {
        const { data } = await apiClient.get<{ url: string }>('/storage/url', {
            params: { path: fileUrl },
        });
        return data.url;
    },
    async getWorkforceDepartments(search: string, empCode: string) {
        const params = { search, empCode };
        const { data } = await apiClient.get('/reports/workforce/departments', { params });
        return data.departments;
    },

    // 2. Get Sites
    async getRobotSites() {
        const { data } = await apiClient.get('/reports/robot-sites');
        return data.sites;
    },

    // 3. Download Robot Report (Excel/PDF)
    async downloadRobotCleaningReport(site: string, month: string, year: string, format: string) {
        const response = await apiClient.get('/reports/jasper/robot-cleaning', {
            params: { site, month, year, format },
            responseType: 'blob' // สำคัญมาก เพื่อให้รับไฟล์ได้ถูกต้อง
        });
        return response.data; // คืนค่าเป็น Blob
    }
};
