import { Response } from 'express';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getCamOwners(): Promise<string[]>;
    getGbbUtReport(site: string, month: string, year: string, res: Response): Promise<void>;
    getGeneralReport(site: string, month: string, year: string, res: Response): Promise<void>;
    getFaceRecReport(site: string, month: string, year: string, res: Response): Promise<void>;
    private sendPdf;
    findAll(domain: string): Promise<import("./entities/report.entity").Report[]>;
    findOne(id: string): Promise<import("./entities/report.entity").Report>;
    download(id: string, res: Response): Promise<void>;
}
