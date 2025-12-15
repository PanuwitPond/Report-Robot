import { apiClient } from './api.client';

export const robotsService = {
    async getAll() {
        // Backend คืนค่ามาเป็น { robots: [...] }
        const { data } = await apiClient.get('/robots');
        return data.robots;
    },
    async create(robot: any) {
        const { data } = await apiClient.post('/robots', robot);
        return data.robot;
    },
    async update(vin: string, robot: any) {
        const { data } = await apiClient.put(`/robots/${vin}`, robot);
        return data.robot;
    },
    async delete(vin: string) {
        return await apiClient.delete(`/robots/${vin}`);
    }
};