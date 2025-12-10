import { StorageService } from './storage.service';
export declare class StorageController {
    private readonly storageService;
    constructor(storageService: StorageService);
    getFileUrl(path: string): Promise<{
        url: string;
    }>;
}
