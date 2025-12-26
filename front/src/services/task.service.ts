import { apiClient } from './api.client';
import type { Task, CreateTaskDTO, UpdateTaskDTO } from '@/types';

export const taskService = {
    async getAll(domain: string): Promise<Task[]> {
        const { data } = await apiClient.get<Task[]>('/tasks', {
            params: { domain },
        });
        return data;
    },

    // [เพิ่มส่วนนี้] เพื่อดึง Site จาก Backend
    async getSites(): Promise<string[]> {
        const { data } = await apiClient.get<{ sites: string[] }>('/reports/robot-sites');
        return data.sites;
    },

    async getById(id: string): Promise<Task> {
        const { data } = await apiClient.get<Task>(`/tasks/${id}`);
        return data;
    },

    async create(taskData: CreateTaskDTO, domain: string): Promise<Task> {
        const formData = new FormData();
        formData.append('taskId', taskData.taskId);
        formData.append('taskName', taskData.taskName);
        formData.append('mapName', taskData.mapName);
        formData.append('mode', taskData.mode);
        formData.append('purpose', taskData.purpose);
        formData.append('siteName', taskData.siteName);
        formData.append('domain', domain);

        if (taskData.image) {
            formData.append('image', taskData.image);
        }

        const { data } = await apiClient.post<Task>('/tasks', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    async update(updateData: UpdateTaskDTO): Promise<Task> {
        const formData = new FormData();
        if (updateData.taskId) formData.append('taskId', updateData.taskId);
        if (updateData.taskName) formData.append('taskName', updateData.taskName);
        if (updateData.mapName) formData.append('mapName', updateData.mapName);
        if (updateData.mode) formData.append('mode', updateData.mode);
        if (updateData.purpose) formData.append('purpose', updateData.purpose);
        if (updateData.siteName) formData.append('siteName', updateData.siteName);
        if (updateData.image) formData.append('image', updateData.image);

        const { data } = await apiClient.patch<Task>(`/tasks/${updateData.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/tasks/${id}`);
    },

    async getImageUrl(imageUrl: string): Promise<string> {
        const { data } = await apiClient.get<{ url: string }>('/storage/url', {
            params: { path: imageUrl },
        });
        return data.url;
    },
};