import type { Domain } from './auth.types';

export type FileType = 'pdf' | 'jpg' | 'png';

export interface Report {
    id: string;
    name: string;
    fileType: FileType;
    fileUrl: string;
    domain: Domain;
    createdAt: string;
}

export interface ReportFilters {
    searchTerm?: string;
    fileType?: FileType;
    startDate?: string;
    endDate?: string;
}
