import { StorageService } from './storage.service';
export declare class StorageController {
    private readonly storageService;
    constructor(storageService: StorageService);
    getFileUrl(path: string): Promise<{
        url: string;
    }>;
    uploadFile(file: Express.Multer.File, domain?: string): Promise<{
        message: string;
        path: string;
    }>;
    listFiles(folder: string): Promise<{
        count: number;
        files: any[];
    }>;
}
