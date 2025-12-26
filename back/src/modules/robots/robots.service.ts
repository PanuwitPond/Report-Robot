import { Injectable, ConflictException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm'; // <--- 1. เพิ่ม Import นี้
import { DataSource } from 'typeorm';

@Injectable()
export class RobotsService {
    constructor(
        @InjectDataSource('robot_conn') private dataSource: DataSource // <--- 2. ใส่ Decorator ระบุชื่อ Connection
    ) {}

    async findAll() {
        const result = await this.dataSource.query(
            'SELECT * FROM metthier.ml_robots WHERE deleted_at IS NULL ORDER BY vin'
        );
        return result;
    }

    async create(data: any) {
        const { vin, name, display_name, workspace_id, site, active } = data;
        
        // Validation แบบง่าย
        if (!vin || !name) {
            throw new Error('VIN and Name are required');
        }

        try {
            const result = await this.dataSource.query(
                `INSERT INTO metthier.ml_robots (vin, name, display_name, workspace_id, site, active, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                 RETURNING *`,
                [vin, name, display_name, workspace_id, site, active]
            );
            return result[0];
        } catch (error) {
            if (error.code === '23505') { // Unique violation code ของ Postgres
                throw new ConflictException('Robot with this VIN already exists');
            }
            throw error;
        }
    }

    async update(vin: string, data: any) {
        const { name, display_name, site, active } = data;
        const result = await this.dataSource.query(
            `UPDATE metthier.ml_robots
             SET name = $1, display_name = $2, site = $3, active = $4, updated_at = NOW()
             WHERE vin = $5
             RETURNING *`,
            [name, display_name, site, active, vin]
        );

        if (result.length === 0) {
            throw new Error('Robot not found');
        }
        return result[0];
    }

    async remove(vin: string) {
        const result = await this.dataSource.query(
            `UPDATE metthier.ml_robots
             SET deleted_at = NOW()
             WHERE vin = $1
             RETURNING *`,
            [vin]
        );

        if (result.length === 0) {
            throw new Error('Robot not found');
        }
        return { message: 'Robot deleted successfully' };
    }
}