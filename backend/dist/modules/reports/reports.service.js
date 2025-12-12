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
    constructor(reportsRepository, storageService, dataSource, miocDataSource) {
        this.reportsRepository = reportsRepository;
        this.storageService = storageService;
        this.dataSource = dataSource;
        this.miocDataSource = miocDataSource;
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
    __metadata("design:paramtypes", [typeorm_2.Repository,
        storage_service_1.StorageService,
        typeorm_2.DataSource,
        typeorm_2.DataSource])
], ReportsService);
//# sourceMappingURL=reports.service.js.map