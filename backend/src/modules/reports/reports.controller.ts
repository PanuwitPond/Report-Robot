import { Controller, Get, Param, Query, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

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
