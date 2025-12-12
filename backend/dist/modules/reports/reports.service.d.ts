import { Repository, DataSource } from 'typeorm';
import { Report } from './entities/report.entity';
import { StorageService } from '@/storage/storage.service';
export declare class ReportsService {
    private reportsRepository;
    private storageService;
    private dataSource;
    private miocDataSource;
    constructor(reportsRepository: Repository<Report>, storageService: StorageService, dataSource: DataSource, miocDataSource: DataSource);
    findAll(domain: string): Promise<Report[]>;
    findOne(id: string): Promise<Report>;
    getFileUrl(fileUrl: string): Promise<string>;
    downloadFile(id: string): Promise<Buffer>;
    getCamOwners(): Promise<string[]>;
    fetchJasperReport(reportName: string, params: Record<string, any>): Promise<Buffer>;
}
