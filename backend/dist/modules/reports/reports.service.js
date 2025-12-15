"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const report_entity_1 = require("./entities/report.entity");
const storage_service_1 = require("../../storage/storage.service");
let ReportsService = class ReportsService {
    constructor(reportsRepository, storageService, dataSource, miocDataSource, robotDataSource, wfDataSource) {
        this.reportsRepository = reportsRepository;
        this.storageService = storageService;
        this.dataSource = dataSource;
        this.miocDataSource = miocDataSource;
        this.robotDataSource = robotDataSource;
        this.wfDataSource = wfDataSource;
    }
    async findAll(domain) {
        return this.reportsRepository.find({
            where: { domain },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        return this.reportsRepository.findOne({ where: { id } });
    }
    async getFileUrl(fileUrl) {
        return this.storageService.getFileUrl(fileUrl);
    }
    async downloadFile(id) {
        const report = await this.findOne(id);
        if (!report) {
            throw new Error('Report not found');
        }
        return this.storageService.getFile(report.fileUrl);
    }
    async getCamOwners() {
        const result = await this.miocDataSource.query(`SELECT DISTINCT camera_owner 
             FROM intrusion_rule_infos 
             WHERE lower(camera_owner) NOT LIKE '%cancel%' 
             ORDER BY camera_owner`);
        return result.map((row) => row.camera_owner);
    }
    async getWorkforceDepartments(search, empCode) {
        let sql;
        let params;
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
        }
        else {
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
        const result = await this.wfDataSource.query(sql, params);
        return result;
    }
    async fetchRobotCleaningReport(site, month, year, format) {
        const jasperBaseUrl = 'http://192.168.100.135:8080/jasperserver/rest_v2/reports/robot_report';
        const username = process.env.JASPER_USERNAME || 'jasperadmin';
        const password = process.env.JASPER_PASSWORD || 'jasperadmin';
        const m = parseInt(month);
        const y = parseInt(year);
        const startDateObj = new Date(y, m - 1, 1);
        const endDateObj = new Date(y, m, 0);
        const formatDate = (date) => {
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        };
        let url;
        let params;
        let extension;
        let mimeType;
        if (format === 'PDF') {
            url = `${jasperBaseUrl}/robot_external_report_pdf.pdf`;
            params = {
                startMonth: month,
                startYear: year,
                client_site: site
            };
            extension = 'pdf';
            mimeType = 'application/pdf';
        }
        else {
            const reportUnit = 'robot_cleaning_report_excel';
            extension = format === 'PDF' ? 'pdf' : 'xlsx';
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
        const auth = Buffer.from(`${username}:${password}`).toString('base64');
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: { Authorization: `Basic ${auth}` }
        });
        if (!response.ok) {
            throw new Error(`Jasper Error: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return {
            buffer: Buffer.from(arrayBuffer),
            filename: `report_${site}_${year}_${month}.${extension}`,
            mimeType
        };
    }
    async getRobotSites() {
        const result = await this.robotDataSource.query('SELECT distinct site FROM metthier.ml_robots WHERE active IS TRUE ORDER BY site');
        return result.map((r) => r.site).filter(Boolean);
    }
    async fetchJasperReport(reportName, params) {
        const jasperBaseUrl = 'http://192.168.100.135:8080/jasperserver/rest_v2/reports/mioc_report';
        const username = process.env.JASPER_USERNAME || 'miocadmin';
        const password = process.env.JASPER_PASSWORD || 'miocadmin';
        const queryString = new URLSearchParams(params).toString();
        const url = `${jasperBaseUrl}/${reportName}.pdf?${queryString}`;
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __param(3, (0, typeorm_1.InjectDataSource)('mioc_conn')),
    __param(4, (0, typeorm_1.InjectDataSource)('robot_conn')),
    __param(5, (0, typeorm_1.InjectDataSource)('wf_conn')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        storage_service_1.StorageService,
        typeorm_2.DataSource,
        typeorm_2.DataSource,
        typeorm_2.DataSource,
        typeorm_2.DataSource])
], ReportsService);
//# sourceMappingURL=reports.service.js.map