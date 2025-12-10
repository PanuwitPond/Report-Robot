import type { Domain } from './auth.types';

export interface RobotImage {
    id: string;
    site: string;
    imageType: string;
    imageUrl: string;
    domain: Domain;
    createdAt: string;
    updatedAt: string;
}

export interface UploadImageDTO {
    site: string;
    imageType: string;
    image: File;
}

export interface UpdateImageDTO {
    id: string;
    site?: string;
    imageType?: string;
    image?: File;
}

export interface ImageFilters {
    site?: string;
    imageType?: string;
    startDate?: string;
    endDate?: string;
}
