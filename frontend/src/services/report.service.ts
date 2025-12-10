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
};
