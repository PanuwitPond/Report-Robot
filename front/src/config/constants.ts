import type { Domain } from '@/types';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Keycloak Configuration
export const KEYCLOAK_CONFIG = {
    url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
    realm: import.meta.env.VITE_KEYCLOAK_REALM || 'robot-report',
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'robot-report-client',
};

// Domain Configuration
export const DOMAINS: Domain[] = ['METTBOT', 'METTPOLE'];

// File Upload Configuration
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
export const ALLOWED_REPORT_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
