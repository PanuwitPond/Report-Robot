import { Request, Response } from 'express';
import { StorageService } from './storage.service';
export declare class StorageController {
    private readonly storageService;
    constructor(storageService: StorageService);
    getFileUrl(path: string, req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
}
