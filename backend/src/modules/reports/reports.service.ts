import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Report } from './entities/report.entity';
import { StorageService } from '@/storage/storage.service';
import { Readable } from 'stream';

// 2. ถ้า Node.js รุ่นเก่าอาจต้องใช้ axios แต่ถ้าใหม่ใช้ fetch ได้เลย (สมมติใช้ fetch)

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Report)
        private reportsRepository: Repository<Report>,
        private storageService: StorageService,
        private dataSource: DataSource, // ใช้สำหรับ Query หลัก (metthier.*, wfm_*)
        @InjectDataSource('mioc_conn') 
        private miocDataSource: DataSource,
        @InjectDataSource('robot_conn') // Inject Robot DB
        private robotDataSource: DataSource,
        @InjectDataSource('wf_conn')    // Inject Workforce DB
        private wfDataSource: DataSource, 
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

        // รับค่ามาเป็น Stream
        const stream = await this.storageService.getFile(report.fileUrl);
        
        // แปลง Stream เป็น Buffer เพื่อให้ตรงกับ Return Type
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk));
        }
        return Buffer.concat(chunks);
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

    async getWorkforceDepartments(search: string, empCode: string): Promise<any[]> {
        let sql: string;
        let params: any[];

        if (empCode && empCode.trim() !== '') {
            sql = `
             WITH fix_emp AS (
             SELECT ws.id, concat(ws.employee_code,': ' ,concat(ws.firstname, ' ',ws.lastname )) AS label, ws.depart_id
             FROM wfm_staffs ws 
             WHERE ws.employee_code = $1
             )
            SELECT 
                wdm.id AS depart_id,
                wdm.th_name AS depart_name, 
                wdm.code AS depart_code, 
                wdm.job_no, 
                wd.th_name AS division_name, 
                ws.th_name AS section_name,
                fe.label,
                COALESCE(s_count.cnt, 0) + COALESCE(ss_count.cnt, 0) AS emp_amount
            FROM wfm_departments wdm
            LEFT JOIN wfm_divisions wd ON wdm.division = wd.id
            LEFT JOIN wfm_sections ws ON wdm."section" = ws.id
            LEFT JOIN (
                SELECT depart_id, COUNT(id) AS cnt
                FROM wfm_staffs
                WHERE workspace = 'samco' 
                GROUP BY depart_id
            ) s_count ON wdm.id = s_count.depart_id
            LEFT JOIN (
                SELECT depart_id, COUNT(DISTINCT staff_id) AS cnt
                FROM wfm_staff_spares
                GROUP BY depart_id
            ) ss_count ON wdm.id = ss_count.depart_id
            INNER JOIN fix_emp fe ON fe.depart_id = wdm.id
            WHERE wdm.th_name LIKE '%รปภ.%'
            `;
            params = [empCode];
        } else {
            const userInput = search || '';
            sql = `
            SELECT 
                wdm.id AS depart_id,
                wdm.th_name AS depart_name, 
                wdm.code AS depart_code, 
                wdm.job_no, 
                wd.th_name AS division_name, 
                ws.th_name AS section_name, 
                COALESCE(s_count.cnt, 0) + COALESCE(ss_count.cnt, 0) AS emp_amount
            FROM wfm_departments wdm
            LEFT JOIN wfm_divisions wd ON wdm.division = wd.id
            LEFT JOIN wfm_sections ws ON wdm."section" = ws.id
            LEFT JOIN (
                SELECT depart_id, COUNT(id) AS cnt
                FROM wfm_staffs
                WHERE workspace = 'samco' 
                GROUP BY depart_id
            ) s_count ON wdm.id = s_count.depart_id
            LEFT JOIN (
                SELECT depart_id, COUNT(DISTINCT staff_id) AS cnt
                FROM wfm_staff_spares
                GROUP BY depart_id
            ) ss_count ON wdm.id = ss_count.depart_id
            WHERE 
                wdm.th_name ILIKE '%' || $1 || '%'
                AND wdm.th_name LIKE '%รปภ.%'
            `;
            params = [userInput];
        }

        // ใช้ dataSource หลักในการ Query
        const result = await this.wfDataSource.query(sql, params);
        return result;
    }

    async fetchRobotCleaningReport(site: string, month: string, year: string, format: string): Promise<{ buffer: Buffer, filename: string, mimeType: string }> {
        const jasperBaseUrl = 'http://192.168.100.135:8080/jasperserver/rest_v2/reports/robot_report';
        const username = process.env.JASPER_USERNAME || 'jasperadmin';
        const password = process.env.JASPER_PASSWORD || 'jasperadmin';

        // คำนวณวันที่ Start/End
        const m = parseInt(month);
        const y = parseInt(year);
        const startDateObj = new Date(y, m - 1, 1);
        const endDateObj = new Date(y, m, 0);

        const formatDate = (date: Date) => {
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        };

        let url: string;
        let params: Record<string, string>;
        let extension: string;
        let mimeType: string;

        if (format === 'PDF') {
            url = `${jasperBaseUrl}/robot_external_report_pdf.pdf`;
            params = {
                startMonth: month,
                startYear: year,
                client_site: site
            };
            extension = 'pdf';
            mimeType = 'application/pdf';
        } else {
            // Default to Excel
            const reportUnit = 'robot_cleaning_report_excel';
            extension = format === 'PDF' ? 'pdf' : 'xlsx'; // จริงๆ logic บนดัก PDF ไปแล้ว แต่เผื่อไว้
            url = `${jasperBaseUrl}/${reportUnit}.${extension}`;
            params = {
                startDate: formatDate(startDateObj),
                endDate: formatDate(endDateObj),
                siteName: site
            };
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }

        const queryString = new URLSearchParams(params).toString();
        const fullUrl = `${url}?${queryString}`;

        console.log('🔍 [Jasper Request] URL:', fullUrl);
        console.log('🔍 [Jasper Request] Params:', params);
        console.log('🔍 [Jasper Request] Auth:', `${username}:***`);

        const auth = Buffer.from(`${username}:${password}`).toString('base64');
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: { Authorization: `Basic ${auth}` }
        });

        console.log('🔍 [Jasper Response] Status:', response.status, response.statusText);
        console.log('🔍 [Jasper Response] Content-Type:', response.headers.get('content-type'));
        console.log('🔍 [Jasper Response] Content-Length:', response.headers.get('content-length'));

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('❌ [Jasper Error Response Body]:', errorBody.substring(0, 500)); // แสดง 500 chars แรก
            throw new Error(`Jasper Error (${response.status} ${response.statusText}): ${errorBody}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        console.log('✅ [Jasper Success] Received buffer size:', buffer.byteLength, 'bytes');
        
        // ตรวจสอบ Magic Number เพื่อยืนยัน File Type
        const magicNumber = buffer.slice(0, 4).toString('hex');
        console.log('🔎 [Buffer Magic Number]:', magicNumber);
        console.log('🔎 [Buffer First 200 chars]:', buffer.slice(0, 200).toString('utf-8', 0, Math.min(200, buffer.length)));
        
        // Excel (.xlsx) = ZIP format, ควรเริ่มด้วย "504b0304" (PK magic number)
        if (magicNumber !== '504b0304') {
            console.warn('⚠️ [Warning] File is NOT Excel/ZIP format!');
            console.warn('⚠️ This might be HTML error response or empty file');
        } else {
            console.log('✅ [Confirmed] File is valid Excel/ZIP format');
        }
        
        // ตรวจสอบ buffer ว่างหรือไม่
        if (buffer.byteLength === 0) {
            console.warn('⚠️ [Warning] Jasper returned empty buffer');
        }

        return {
            buffer: buffer,
            filename: `report_${site}_${year}_${month}.${extension}`,
            mimeType
        };
    }
    
    // 3. Get Sites for Robot (ย้ายมาจาก /api/sites)
    async getRobotSites(): Promise<string[]> {
        const result = await this.robotDataSource.query(
            'SELECT distinct site FROM metthier.ml_robots WHERE active IS TRUE ORDER BY site'
        );
        return result.map((r: any) => r.site).filter(Boolean);
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