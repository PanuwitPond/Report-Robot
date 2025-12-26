import axios from 'axios';
import { API_BASE_URL } from '@/config';

// ✅ FIX #5: Differentiate timeout by request type
// Normal API calls: 15 seconds
// File downloads: 120 seconds
const DEFAULT_TIMEOUT = 15000;
const FILE_DOWNLOAD_TIMEOUT = 120000;

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: DEFAULT_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - attach token and set dynamic timeout
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // ✅ Set longer timeout for file downloads
        if (config.url?.includes('/download') || config.url?.includes('/export')) {
            config.timeout = FILE_DOWNLOAD_TIMEOUT;
        } else {
            config.timeout = DEFAULT_TIMEOUT;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/signin';
        }
        return Promise.reject(error);
    }
);
