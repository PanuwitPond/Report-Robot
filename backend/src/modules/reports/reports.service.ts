import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { StorageService } from '@/storage/storage.service';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Report)
        private reportsRepository: Repository<Report>,
        private storageService: StorageService,
    ) { }

    async findAll(domain: string): Promise<Report[]> {
        return this.reportsRepository.find({
            where: { domain },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Report> {
        return this.reportsRepository.findOne({ where: { id } });
    }

    async getFileUrl(fileUrl: string): Promise<string> {
        return this.storageService.getFileUrl(fileUrl);
    }

    async downloadFile(id: string): Promise<Buffer> {
        const report = await this.findOne(id);
        if (!report) {
            throw new Error('Report not found');
        }
        return this.storageService.getFile(report.fileUrl);
    }
}
