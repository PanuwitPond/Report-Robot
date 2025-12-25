import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class IncidentsService implements OnModuleInit {
    constructor(
        @InjectDataSource('mioc_conn') private miocDataSource: DataSource
    ) {}

    // ✅ เปลี่ยนมาเช็ค Params ของไฟล์ 12_trueAlarm.jrxml แทน (เผื่อต้อง Debug)
    async onModuleInit() {
        // บรรทัดนี้จะช่วยบอกเราว่า 12_trueAlarm ต้องการ parameter ชื่ออะไรแน่ (ดูใน Console ตอนรัน)
        await this.checkReportParameters('12_trueAlarm.jrxml');
    }

    async checkReportParameters(reportUnit: string) {
        console.log(`🕵️‍♂️ [Jasper Debug] Checking parameters for: ${reportUnit}`);
        const jasperBaseUrl = 'http://192.168.100.135:8080/jasperserver/rest_v2/reports/mioc_report';
        const url = `${jasperBaseUrl}/${reportUnit}/inputControls`;
        
        const username = process.env.JASPER_USERNAME || 'miocadmin';
        const password = process.env.JASPER_PASSWORD || 'miocadmin';
        const auth = Buffer.from(`${username}:${password}`).toString('base64');

        try {
            const response = await fetch(url, {
                headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ [Jasper Params] Report "${reportUnit}" requires:`);
                const controls = Array.isArray(data.inputControl) 
                    ? data.inputControl 
                    : (data.inputControl ? [data.inputControl] : []);
                
                if (controls.length === 0) console.log('   - No input controls found (might use internal params)');
                controls.forEach((c: any) => console.log(`   - ${c.id} (${c.type})`));
            }
        } catch (error) {
            console.log('⚠️ [Jasper Debug] Skipped param check (Network/Auth error)');
        }
    }

    // --- Main Logic ---

    async getComplete() {
        const sql = `
            SELECT id, incident_no, COALESCE(event_time::text, created_at::text) as event_time, mioc_contract_time, 'Completed' as status
            FROM intrusion_truealarms 
            WHERE deleted_at IS NULL AND conclusion IS NOT NULL AND conclusion != ''
            ORDER BY created_at DESC
        `;
        return this.miocDataSource.query(sql);
    }

    async getIncomplete() {
        const sql = `
            SELECT id, incident_no, COALESCE(event_time::text, created_at::text) as event_time, mioc_contract_time, 'Incomplete' as status
            FROM intrusion_truealarms 
            WHERE deleted_at IS NULL AND (conclusion IS NULL OR conclusion = '')
            ORDER BY created_at DESC
        `;
        return this.miocDataSource.query(sql);
    }

    async getById(id: string) {
        return (await this.miocDataSource.query(`SELECT * FROM intrusion_truealarms WHERE id = $1`, [id]))[0];
    }

    async getIncidentReport(id: string): Promise<Buffer> {
        const incident = await this.getById(id);
        if (!incident) throw new Error('Incident not found');

        // ✅ 1. ใช้ชื่อ Report ที่ถูกต้อง
        const reportUnit = '12_trueAlarm.jrxml'; 
        
        const jasperBaseUrl = 'http://192.168.100.135:8080/jasperserver/rest_v2/reports/mioc_report';
        const username = process.env.JASPER_USERNAME || 'miocadmin';
        const password = process.env.JASPER_PASSWORD || 'miocadmin';
        
        // ✅ 2. ส่ง Parameter ไปทุกแบบที่เป็นไปได้ (Jasper จะเลือกตัวที่ชื่อตรงกันเอง)
        const params = {
            id: id,                  // ชื่อมาตรฐาน 1
            incident_id: id,         // ชื่อมาตรฐาน 2
            p_id: id,                // ชื่อมาตรฐาน 3 (Parameter ID)
            P_ID: id,                // ตัวใหญ่
            incident_no: incident.incident_no 
        };

        const queryString = new URLSearchParams(params as any).toString();
        const url = `${jasperBaseUrl}/${reportUnit}.pdf?${queryString}`;

        console.log('📄 [Jasper] Downloading from:', url);

        const auth = Buffer.from(`${username}:${password}`).toString('base64');
        const response = await fetch(url, {
            method: 'GET',
            headers: { Authorization: `Basic ${auth}` }
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`❌ [Jasper Error ${response.status}]:`, errText);
            throw new Error(`Jasper Failed: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        console.log('✅ [Jasper] Success! Size:', arrayBuffer.byteLength);
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