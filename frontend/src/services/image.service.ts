import { apiClient } from './api.client';
import type { RobotImage, UploadImageDTO, UpdateImageDTO, ImageFilters } from '@/types';

export const imageService = {
    async getAll(domain: string, filters?: ImageFilters): Promise<RobotImage[]> {
        const { data } = await apiClient.get<RobotImage[]>('/images', {
            params: { domain, ...filters },
        });
        return data;
    },

    async getById(id: string): Promise<RobotImage> {
        const { data } = await apiClient.get<RobotImage>(`/images/${id}`);
        return data;
    },

    async upload(imageData: UploadImageDTO, domain: string): Promise<RobotImage> {
        const formData = new FormData();

        formData.append('site', imageData.site);
        formData.append('imageType', imageData.imageType);
        formData.append('image', imageData.image);
        formData.append('domain', domain);

        const { data } = await apiClient.post<RobotImage>('/images', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },

    async update(updateData: UpdateImageDTO): Promise<RobotImage> {
        const formData = new FormData();

        if (updateData.site) formData.append('site', updateData.site);
        if (updateData.imageType) formData.append('imageType', updateData.imageType);
        if (updateData.image) formData.append('image', updateData.image);

        const { data } = await apiClient.patch<RobotImage>(`/images/${updateData.id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/images/${id}`);
    },

    async getImageUrl(imageUrl: string): Promise<string> {
        const { data } = await apiClient.get<{ url: string }>('/storage/url', {
            params: { path: imageUrl },
        });
        return data.url;
    },
};
