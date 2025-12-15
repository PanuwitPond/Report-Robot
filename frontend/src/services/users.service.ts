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

    async addUser(username: string, email: string, firstName?: string, lastName?: string, password?: string, emailVerified?: boolean): Promise<any> {
        const { data } = await apiClient.post('/users', {
            username,
            email,
            firstName: firstName || '',
            lastName: lastName || '',
            password: password || null,
            emailVerified: emailVerified || false,
        });
        return data;
    },

    async assignRole(userId: string, roleName: string): Promise<void> {
        await apiClient.post(`/users/${userId}/roles`, { roleName });
    },

    async removeRole(userId: string, roleName: string): Promise<void> {
        await apiClient.delete(`/users/${userId}/roles/${roleName}`);
    },
};
