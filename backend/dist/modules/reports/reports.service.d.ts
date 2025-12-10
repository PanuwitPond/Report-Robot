import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { StorageService } from '@/storage/storage.service';
export declare class ReportsService {
    private reportsRepository;
    private storageService;
    constructor(reportsRepository: Repository<Report>, storageService: StorageService);
    findAll(domain: string): Promise<Report[]>;
    findOne(id: string): Promise<Report>;
    getFileUrl(fileUrl: string): Promise<string>;
    downloadFile(id: string): Promise<Buffer>;
}
