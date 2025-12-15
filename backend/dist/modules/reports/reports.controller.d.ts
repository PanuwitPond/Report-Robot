import { Response } from 'express';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getCamOwners(): Promise<string[]>;
    getRobotSites(): Promise<{
        sites: string[];
    }>;
    getDepartments(search: string, empCode: string): Promise<{
        departments: any[];
    }>;
    getRobotCleaningReport(site: string, month: string, year: string, format: string, res: Response): Promise<void>;
    getGbbUtReport(site: string, month: string, year: string, res: Response): Promise<void>;
    getGeneralReport(site: string, month: string, year: string, res: Response): Promise<void>;
    getFaceRecReport(site: string, month: string, year: string, res: Response): Promise<void>;
    findAll(domain: string): Promise<import("./entities/report.entity").Report[]>;
    findOne(id: string): Promise<import("./entities/report.entity").Report>;
    download(id: string, res: Response): Promise<void>;
    private sendPdf;
}
