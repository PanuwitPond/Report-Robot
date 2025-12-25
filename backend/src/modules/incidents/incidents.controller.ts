import { Controller, Get, Post, Delete, Param, Body, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { IncidentsService } from './incidents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('incidents')
// @UseGuards(JwtAuthGuard, RolesGuard)  // Temporarily disabled for testing
export class IncidentsController {
    constructor(private readonly incidentsService: IncidentsService) {}

    @Get('complete')
    async getComplete() {
        const data = await this.incidentsService.getComplete();
        return data;
    }

    @Get('incomplete')
    async getIncomplete() {
        const data = await this.incidentsService.getIncomplete();
        return data;
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
        const data = await this.incidentsService.getById(id);
        return data;
    }

    @Get(':id/report')
    async getReport(@Param('id') id: string, @Res() res: Response) {
        try {
            const buffer = await this.incidentsService.getIncidentReport(id);
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="incident_${id}.pdf"`,
                'Content-Length': buffer.length,
            });
            res.send(buffer);
        } catch (error) {
            res.status(500).json({ error: 'Failed to generate report' });
        }
    }

    @Post(':id/update')
    async update(@Param('id') id: string, @Body() updateData: any) {
        const success = await this.incidentsService.update(id, updateData);
        return { success, message: success ? 'Updated successfully' : 'Failed to update' };
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        const success = await this.incidentsService.delete(id);
        return { success, message: success ? 'Deleted successfully' : 'Failed to delete' };
    }
}
