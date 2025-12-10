import type { Domain } from './auth.types';

export interface Task {
    id: string;
    taskId: string;
    taskName: string;
    mapName: string;
    mode: string;
    purpose: string;
    siteName: string;
    imageUrl?: string;
    domain: Domain;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskDTO {
    taskId: string;
    taskName: string;
    mapName: string;
    mode: string;
    purpose: string;
    siteName: string;
    image?: File;
}

export interface UpdateTaskDTO extends Partial<CreateTaskDTO> {
    id: string;
}
