import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class IncidentsService {
    constructor(
        @InjectDataSource('mioc_conn') private miocDataSource: DataSource
    ) {}

    // 1. ดึงเคสที่จบแล้ว (Complete) -> แก้ SQL ให้ดึงทุกคอลัมน์ (*)
    async getComplete() {
        const sql = `
            SELECT *, 
                -- แปลงวันที่เป็น text เพื่อป้องกัน error เรื่อง timezone ในบางกรณี
                COALESCE(event_time::text, created_at::text) as event_time_str, 
                'Completed' as status
            FROM intrusion_truealarms 
            WHERE deleted_at IS NULL 
            AND conclusion IS NOT NULL 
            AND conclusion != ''
            ORDER BY created_at DESC
        `;
        return this.miocDataSource.query(sql);
    }

    // 2. ดึงเคสที่ยังไม่จบ (Incomplete) -> แก้ SQL ให้ดึงทุกคอลัมน์ (*) เช่นกัน
    async getIncomplete() {
        const sql = `
            SELECT *, 
                COALESCE(event_time::text, created_at::text) as event_time_str, 
                'Incomplete' as status
            FROM intrusion_truealarms 
            WHERE deleted_at IS NULL 
            AND (conclusion IS NULL OR conclusion = '')
            ORDER BY created_at DESC
        `;
        return this.miocDataSource.query(sql);
    }

    async getById(id: string) {
        const sql = `SELECT * FROM intrusion_truealarms WHERE id = $1`;
        const result = await this.miocDataSource.query(sql, [id]);
        return result[0];
    }

    // --- ส่วนฟังก์ชัน getIncidentReport, update, delete ใช้โค้ดเดิมได้เลย ---
    async getIncidentReport(id: string): Promise<Buffer> {
        const incident = await this.getById(id);
        if (!incident) throw new Error('Incident not found');

        const reportUnit = '12_trueAlarm.jrxml'; // หรือ 'mioc_external_report'
        const jasperBaseUrl = 'http://192.168.100.135:8080/jasperserver/rest_v2/reports/mioc_report';
        const username = process.env.JASPER_USERNAME || 'miocadmin';
        const password = process.env.JASPER_PASSWORD || 'miocadmin';
        
        const params = {
            id: id,
            incident_id: id,
            p_id: id,
            incident_no: incident.incident_no 
        };

        const queryString = new URLSearchParams(params as any).toString();
        const url = `${jasperBaseUrl}/${reportUnit}.pdf?${queryString}`;

        console.log('📄 [Jasper] Downloading:', url);

        const auth = Buffer.from(`${username}:${password}`).toString('base64');
        const response = await fetch(url, {
            method: 'GET',
            headers: { Authorization: `Basic ${auth}` }
        });

        if (!response.ok) {
            throw new Error(`Jasper Failed: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }

    async update(id: string, updateData: any) {
        const fields = Object.keys(updateData);
        if (fields.length === 0) return false;
        const setClause = fields.map((field, index) => `"${field}" = $${index + 2}`).join(', ');
        const values = Object.values(updateData);
        const sql = `UPDATE intrusion_truealarms SET ${setClause}, updated_at = NOW() WHERE id = $1`;
        await this.miocDataSource.query(sql, [id, ...values]);
        return true;
    }

    async delete(id: string) {
        await this.miocDataSource.query(`UPDATE intrusion_truealarms SET deleted_at = NOW() WHERE id = $1`, [id]);
        return true;
    }
}