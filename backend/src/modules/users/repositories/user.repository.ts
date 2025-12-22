/**
 * User Repository
 * Handles all database operations for users
 */

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '@/shared/repositories/base.repository';
import { IUser } from '../types/user.types';
import { UserDto, PaginatedUsersDto } from '../dtos/user.dto';

@Injectable()
export class UserRepository extends BaseRepository<IUser> {
    protected tableName = 'users';

    constructor(dataSource: DataSource) {
        super(dataSource);
    }

    /**
     * Find user by username
     */
    async findByUsername(username: string): Promise<IUser | null> {
        return this.findOneBy({ username });
    }

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<IUser | null> {
        return this.findOneBy({ email });
    }

    /**
     * Get all users with pagination
     */
    async findAllPaginated(
        limit: number = 10,
        offset: number = 0,
        filters?: {
            username?: string;
            email?: string;
            role?: string;
            status?: string;
        },
    ): Promise<PaginatedUsersDto> {
        let query = `SELECT * FROM "${this.tableName}" WHERE deleted_at IS NULL`;
        const params: any[] = [];
        let paramIndex = 1;

        // Apply filters
        if (filters?.username) {
            query += ` AND username ILIKE $${paramIndex}`;
            params.push(`%${filters.username}%`);
            paramIndex++;
        }

        if (filters?.email) {
            query += ` AND email ILIKE $${paramIndex}`;
            params.push(`%${filters.email}%`);
            paramIndex++;
        }

        if (filters?.role) {
            query += ` AND role = $${paramIndex}`;
            params.push(filters.role);
            paramIndex++;
        }

        if (filters?.status) {
            query += ` AND status = $${paramIndex}`;
            params.push(filters.status);
            paramIndex++;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        // Get total count with filters
        let countQuery = `SELECT COUNT(*) as count FROM "${this.tableName}" WHERE deleted_at IS NULL`;
        const filterParams: any[] = [];

        if (filters?.username) {
            countQuery += ` AND username ILIKE $${filterParams.length + 1}`;
            filterParams.push(`%${filters.username}%`);
        }

        if (filters?.email) {
            countQuery += ` AND email ILIKE $${filterParams.length + 1}`;
            filterParams.push(`%${filters.email}%`);
        }

        if (filters?.role) {
            countQuery += ` AND role = $${filterParams.length + 1}`;
            filterParams.push(filters.role);
        }

        if (filters?.status) {
            countQuery += ` AND status = $${filterParams.length + 1}`;
            filterParams.push(filters.status);
        }

        const [users, countResult] = await Promise.all([
            this.execute<IUser>(query, params),
            this.executeOne<{ count: string }>(countQuery, filterParams),
        ]);

        const total = countResult ? parseInt(countResult.count, 10) : 0;
        const page = Math.floor(offset / limit) + 1;
        const pages = Math.ceil(total / limit);

        const userDtos = users.map(user => new UserDto(user));
        return new PaginatedUsersDto(userDtos, total, limit, offset);
    }

    /**
     * Get users by role
     */
    async findByRole(role: string): Promise<IUser[]> {
        return this.findBy({ role });
    }

    /**
     * Count users by role
     */
    async countByRole(role: string): Promise<number> {
        const query = `SELECT COUNT(*) as count FROM "${this.tableName}" WHERE role = $1 AND deleted_at IS NULL`;
        return this.executeCount(query, [role]);
    }

    /**
     * Check if username exists
     */
    async usernameExists(username: string): Promise<boolean> {
        return (await this.findByUsername(username)) !== null;
    }

    /**
     * Check if email exists
     */
    async emailExists(email: string): Promise<boolean> {
        return (await this.findByEmail(email)) !== null;
    }

    /**
     * Get user with their roles
     */
    async findByIdWithRoles(id: string | number): Promise<IUser | null> {
        const query = `
            SELECT u.*, 
                   array_agg(DISTINCT r.name) as roles
            FROM "${this.tableName}" u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE u.id = $1 AND u.deleted_at IS NULL
            GROUP BY u.id
        `;
        return this.executeOne<IUser>(query, [id]);
    }

    /**
     * Get users by status
     */
    async findByStatus(status: string): Promise<IUser[]> {
        return this.findBy({ status });
    }

    /**
     * Get user statistics
     */
    async getStatistics(): Promise<{
        total: number;
        by_role: Record<string, number>;
        by_status: Record<string, number>;
    }> {
        const total = await this.count();

        const byRoleResults = await this.execute<{ role: string; count: string }>(
            `SELECT role, COUNT(*) as count FROM "${this.tableName}" WHERE deleted_at IS NULL GROUP BY role`,
        );

        const byStatusResults = await this.execute<{ status: string; count: string }>(
            `SELECT status, COUNT(*) as count FROM "${this.tableName}" WHERE deleted_at IS NULL GROUP BY status`,
        );

        const byRole: Record<string, number> = {};
        const byStatus: Record<string, number> = {};

        byRoleResults.forEach(({ role, count }) => {
            byRole[role] = parseInt(count, 10);
        });

        byStatusResults.forEach(({ status, count }) => {
            byStatus[status] = parseInt(count, 10);
        });

        return { total, by_role: byRole, by_status: byStatus };
    }

    /**
     * Assign role to user
     */
    async assignRole(userId: string | number, roleId: string | number): Promise<void> {
        const query = `
            INSERT INTO user_roles (user_id, role_id, created_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (user_id, role_id) DO NOTHING
        `;
        await this.dataSource.query(query, [userId, roleId]);
    }

    /**
     * Remove role from user
     */
    async removeRole(userId: string | number, roleId: string | number): Promise<void> {
        const query = `DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2`;
        await this.dataSource.query(query, [userId, roleId]);
    }

    /**
     * Update last login
     */
    async updateLastLogin(userId: string | number): Promise<void> {
        const query = `UPDATE "${this.tableName}" SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1`;
        await this.dataSource.query(query, [userId]);
    }
}
