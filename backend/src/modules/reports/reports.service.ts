import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; // 1. เพิ่ม DataSource
import { Report } from './entities/report.entity';
import { StorageService } from '@/storage/storage.service';
// 2. ถ้า Node.js รุ่นเก่าอาจต้องใช้ axios แต่ถ้าใหม่ใช้ fetch ได้เลย (สมมติใช้ fetch)

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Report)
        private reportsRepository: Repository<Report>,
        private storageService: StorageService,
        private dataSource: DataSource, // 3. Inject DataSource เพื่อทำ Raw Query
        @InjectDataSource('mioc_conn') 
        private miocDataSource: DataSource, 
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

    // --- ส่วนที่เพิ่มใหม่สำหรับ Migration ---

    // 1. ฟังก์ชันดึงรายชื่อ Site (Cam Owner)
    async getCamOwners(): Promise<string[]> {
        // ใช้ miocDataSource เพื่อ query ไปที่ Database เก่า (metlink_app_db)
        const result = await this.miocDataSource.query(
            `SELECT DISTINCT camera_owner 
             FROM intrusion_rule_infos 
             WHERE lower(camera_owner) NOT LIKE '%cancel%' 
             ORDER BY camera_owner`
        );
        return result.map((row: any) => row.camera_owner);
    }

    
    // 2. ฟังก์ชันดึง PDF จาก Jasper Server (รวมทุกแบบไว้ในฟังก์ชันเดียว)
    async fetchJasperReport(reportName: string, params: Record<string, any>): Promise<Buffer> {
        const jasperBaseUrl = 'http://192.168.100.135:8080/jasperserver/rest_v2/reports/mioc_report';
        const username = process.env.JASPER_USERNAME || 'miocadmin';
        const password = process.env.JASPER_PASSWORD || 'miocadmin';
        
        // สร้าง Query String
        const queryString = new URLSearchParams(params).toString();
        const url = `${jasperBaseUrl}/${reportName}.pdf?${queryString}`;

        // Basic Auth
        const auth = Buffer.from(`${username}:${password}`).toString('base64');

        const response = await fetch(url, {
            method: 'GET',
            headers: { Authorization: `Basic ${auth}` }
        });

        if (!response.ok) {
            throw new Error(`Jasper Error: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }
}