import { apiClient } from './api.client';
import type { LoginResponse } from '@/types';

export const authService = {
    async login(username: string, password: string): Promise<LoginResponse> {
        const { data } = await apiClient.post<LoginResponse>('/auth/login', {
            username,
            password,
        });

        // Store tokens
        localStorage.setItem('access_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);

        return data;
    },

    async logout(): Promise<void> {
        try {
            await apiClient.post('/auth/logout');
        } finally {
            // Clear tokens regardless of API response
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
    },

    async refreshToken(): Promise<string> {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const { data } = await apiClient.post<{ accessToken: string }>('/auth/refresh', {
            refreshToken,
        });

        localStorage.setItem('access_token', data.accessToken);
        return data.accessToken;
    },

    getAccessToken(): string | null {
        return localStorage.getItem('access_token');
    },

    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    },
    async me(): Promise<any> {
        const { data } = await (await import('./api.client')).apiClient.get('/auth/me');
        return data;
    }
};
