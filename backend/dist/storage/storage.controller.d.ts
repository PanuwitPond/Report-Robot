import { Request, Response } from 'express';
import { StorageService } from './storage.service';
export declare class StorageController {
    private readonly storageService;
    constructor(storageService: StorageService);
    getFileUrl(path: string, req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
    listObjects(prefix?: string): Promise<{
        success: boolean;
        prefix: string;
        objects: {
            name: string;
            size: number;
            lastModified: Date;
            isDir: boolean;
        }[];
    }>;
    downloadFile(path: string, res: Response): Promise<void>;
    deleteFile(path: string): Promise<{
        success: boolean;
        message: string;
        path: string;
    }>;
}
