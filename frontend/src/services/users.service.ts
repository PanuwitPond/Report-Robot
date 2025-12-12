import { apiClient } from './api.client';

export interface UserWithRoles {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    enabled: boolean;
    roles: string[];
}

export const usersService = {
    async getAllUsers(): Promise<UserWithRoles[]> {
        const { data } = await apiClient.get<UserWithRoles[]>('/users');
        return data;
    },

    async getAvailableRoles(): Promise<string[]> {
        const { data } = await apiClient.get<string[]>('/users/available-roles');
        return data;
    },

    async assignRole(userId: string, roleName: string): Promise<void> {
        await apiClient.post(`/users/${userId}/roles`, { roleName });
    },

    async removeRole(userId: string, roleName: string): Promise<void> {
        await apiClient.delete(`/users/${userId}/roles/${roleName}`);
    },
    async createUser(payload: any): Promise<{ id: string }> {
        const { data } = await apiClient.post('/users', payload);
        return data;
    },
    async setPassword(userId: string, payload: { password: string; temporary?: boolean }): Promise<void> {
        await apiClient.put(`/users/${userId}/credentials`, payload);
    },
    async deleteUser(userId: string, payload: { confirmUsername: string; adminPassword: string }): Promise<void> {
        await apiClient.delete(`/users/${userId}`, { data: payload });
    },
};
