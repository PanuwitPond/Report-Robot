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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async getCamOwners() {
        return this.reportsService.getCamOwners();
    }
    async getGbbUtReport(site, month, year, res) {
        const file = await this.reportsService.fetchJasperReport('mioc_external_report_gbb_ut', { cameraOwner: site, startMonth: month, startYear: year });
        this.sendPdf(res, `report_gbb-ut_${site}_${month}_${year}.pdf`, file);
    }
    async getGeneralReport(site, month, year, res) {
        const file = await this.reportsService.fetchJasperReport('mioc_external_report', { cameraOwner: site, startMonth: month, startYear: year });
        this.sendPdf(res, `report_${site}_${month}_${year}.pdf`, file);
    }
    async getFaceRecReport(site, month, year, res) {
        const file = await this.reportsService.fetchJasperReport('face_rec_nobl', { cameraOwner: site, startMonth: month, startYear: year });
        this.sendPdf(res, `report_face_rec_${site}_${month}_${year}.pdf`, file);
    }
    sendPdf(res, filename, buffer) {
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length,
        });
        res.send(buffer);
    }
    async findAll(domain) {
        return this.reportsService.findAll(domain);
    }
    async findOne(id) {
        return this.reportsService.findOne(id);
    }
    async download(id, res) {
        const file = await this.reportsService.downloadFile(id);
        const report = await this.reportsService.findOne(id);
        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${report.name}"`,
        });
        res.send(file);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('cam-owners'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getCamOwners", null);
__decorate([
    (0, common_1.Get)('jasper/gbbut'),
    __param(0, (0, common_1.Query)('site')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getGbbUtReport", null);
__decorate([
    (0, common_1.Get)('jasper/general'),
    __param(0, (0, common_1.Query)('site')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getGeneralReport", null);
__decorate([
    (0, common_1.Get)('jasper/face-rec'),
    __param(0, (0, common_1.Query)('site')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getFaceRecReport", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('domain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "download", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map