/**
 * Robot Repository
 * Handles all database operations for robots
 */

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '@/shared/repositories/base.repository';
import { RobotEntity } from '../entities/robot.entity';
import { RobotDto, PaginatedRobotsDto } from '../dtos/robot.dto';

@Injectable()
export class RobotRepository extends BaseRepository<RobotEntity> {
    protected tableName = 'robots';

    constructor(dataSource: DataSource) {
        super(dataSource);
    }

    /**
     * Find robot by VIN
     */
    async findByVin(vin: string): Promise<RobotEntity | null> {
        return this.findOneBy({ vin });
    }

    /**
     * Find all active robots
     */
    async findAllActive(): Promise<RobotEntity[]> {
        return this.findBy({ is_active: true });
    }

    /**
     * Find robots with pagination
     */
    async findAllPaginated(
        limit: number = 10,
        offset: number = 0,
        filters?: {
            name?: string;
            status?: string;
            is_active?: boolean;
        },
    ): Promise<PaginatedRobotsDto> {
        let query = `SELECT * FROM "${this.tableName}" WHERE deleted_at IS NULL`;
        const params: any[] = [];
        let paramIndex = 1;

        // Apply filters
        if (filters?.name) {
            query += ` AND name ILIKE $${paramIndex}`;
            params.push(`%${filters.name}%`);
            paramIndex++;
        }

        if (filters?.status) {
            query += ` AND status = $${paramIndex}`;
            params.push(filters.status);
            paramIndex++;
        }

        if (filters?.is_active !== undefined) {
            query += ` AND is_active = $${paramIndex}`;
            params.push(filters.is_active);
            paramIndex++;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        // Get total count
        let countQuery = `SELECT COUNT(*) as count FROM "${this.tableName}" WHERE deleted_at IS NULL`;
        if (filters?.name) {
            countQuery += ` AND name ILIKE $1`;
        }
        if (filters?.status) {
            const idx = filters.name ? 2 : 1;
            countQuery += ` AND status = $${idx}`;
        }
        if (filters?.is_active !== undefined) {
            const idx = (filters.name ? 1 : 0) + (filters.status ? 1 : 0) + 1;
            countQuery += ` AND is_active = $${idx}`;
        }

        const filterParams = [];
        if (filters?.name) filterParams.push(`%${filters.name}%`);
        if (filters?.status) filterParams.push(filters.status);
        if (filters?.is_active !== undefined) filterParams.push(filters.is_active);

        const [robots, countResult] = await Promise.all([
            this.execute<RobotEntity>(query, params),
            this.executeOne<{ count: string }>(countQuery, filterParams),
        ]);

        const total = countResult ? parseInt(countResult.count, 10) : 0;
        const page = Math.floor(offset / limit) + 1;
        const pages = Math.ceil(total / limit);

        const robotDtos = robots.map(robot => new RobotDto(robot));
        return new PaginatedRobotsDto(robotDtos, total, limit, offset);
    }

    /**
     * Update robot by VIN
     */
    async updateByVin(vin: string, data: Partial<RobotEntity>): Promise<RobotEntity | null> {
        const robot = await this.findByVin(vin);
        if (!robot) return null;
        return this.update(robot.id, data);
    }

    /**
     * Count robots by status
     */
    async countByStatus(status: string): Promise<number> {
        const query = `SELECT COUNT(*) as count FROM "${this.tableName}" WHERE status = $1 AND deleted_at IS NULL`;
        return this.executeCount(query, [status]);
    }

    /**
     * Find robots by model
     */
    async findByModel(model: string): Promise<RobotEntity[]> {
        return this.findBy({ model });
    }

    /**
     * Get robot statistics
     */
    async getStatistics(): Promise<{
        total: number;
        active: number;
        inactive: number;
        by_status: Record<string, number>;
    }> {
        const [total, active, inactive, byStatus] = await Promise.all([
            this.count(),
            this.executeCount(`SELECT COUNT(*) as count FROM "${this.tableName}" WHERE is_active = true AND deleted_at IS NULL`),
            this.executeCount(`SELECT COUNT(*) as count FROM "${this.tableName}" WHERE is_active = false AND deleted_at IS NULL`),
            this.execute<{ status: string; count: string }>(
                `SELECT status, COUNT(*) as count FROM "${this.tableName}" WHERE deleted_at IS NULL GROUP BY status`,
            ),
        ]);

        const statusCounts: Record<string, number> = {};
        byStatus.forEach(({ status, count }) => {
            statusCounts[status] = parseInt(count, 10);
        });

        return {
            total,
            active,
            inactive,
            by_status: statusCounts,
        };
    }

    /**
     * Delete robot by VIN
     */
    async deleteByVin(vin: string): Promise<boolean> {
        const robot = await this.findByVin(vin);
        if (!robot) return false;
        return this.delete(robot.id);
    }
}
