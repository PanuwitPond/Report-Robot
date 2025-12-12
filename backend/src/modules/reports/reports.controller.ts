import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    // --- API ใหม่สำหรับ Migration ---

    @Get('cam-owners')
    async getCamOwners() {
        return this.reportsService.getCamOwners();
    }

    @Get('jasper/gbbut')
    async getGbbUtReport(@Query('site') site: string, @Query('month') month: string, @Query('year') year: string, @Res() res: Response) {
        const file = await this.reportsService.fetchJasperReport('mioc_external_report_gbb_ut', { cameraOwner: site, startMonth: month, startYear: year });
        this.sendPdf(res, `report_gbb-ut_${site}_${month}_${year}.pdf`, file);
    }

    @Get('jasper/general')
    async getGeneralReport(@Query('site') site: string, @Query('month') month: string, @Query('year') year: string, @Res() res: Response) {
        const file = await this.reportsService.fetchJasperReport('mioc_external_report', { cameraOwner: site, startMonth: month, startYear: year });
        this.sendPdf(res, `report_${site}_${month}_${year}.pdf`, file);
    }

    @Get('jasper/face-rec')
    async getFaceRecReport(@Query('site') site: string, @Query('month') month: string, @Query('year') year: string, @Res() res: Response) {
        const file = await this.reportsService.fetchJasperReport('face_rec_nobl', { cameraOwner: site, startMonth: month, startYear: year });
        this.sendPdf(res, `report_face_rec_${site}_${month}_${year}.pdf`, file);
    }

    // Helper function สำหรับส่งไฟล์ PDF
    private sendPdf(res: Response, filename: string, buffer: Buffer) {
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length,
        });
        res.send(buffer);
    }

    // --- API เดิม ---

    @Get()
    async findAll(@Query('domain') domain: string) {
        return this.reportsService.findAll(domain);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.reportsService.findOne(id);
    }

    @Get(':id/download')
    async download(@Param('id') id: string, @Res() res: Response) {
        const file = await this.reportsService.downloadFile(id);
        const report = await this.reportsService.findOne(id);

        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${report.name}"`,
        });

        res.send(file);
    }
}