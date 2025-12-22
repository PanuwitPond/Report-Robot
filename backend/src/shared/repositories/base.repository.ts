/**
 * Base Repository Class
 * Provides common CRUD operations and query building functionality
 */

import { DataSource, SelectQueryBuilder } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';

/**
 * Generic base repository with common operations
 * All repositories should extend this class
 */
@Injectable()
export abstract class BaseRepository<T> {
    protected tableName: string;
    protected schema: string = 'public';
    protected readonly logger = new Logger(this.constructor.name);

    constructor(protected dataSource: DataSource) {}

    /**
     * Set the schema name
     */
    setSchema(schema: string): this {
        this.schema = schema;
        return this;
    }

    /**
     * Get fully qualified table name
     */
    public getTableName(): string {
        return this.schema ? `"${this.schema}"."${this.tableName}"` : `"${this.tableName}"`;
    }

    /**
     * Execute raw SQL query
     */
    public async execute<R = any>(
        query: string,
        parameters: any[] = [],
    ): Promise<R[]> {
        return this.dataSource.query(query, parameters);
    }

    /**
     * Execute raw SQL and return single result
     */
    public async executeOne<R = any>(
        query: string,
        parameters: any[] = [],
    ): Promise<R | null> {
        const results = await this.dataSource.query(query, parameters);
        return results.length > 0 ? results[0] : null;
    }

    /**
     * Execute raw SQL and return count
     */
    public async executeCount(
        query: string,
        parameters: any[] = [],
    ): Promise<number> {
        const result = await this.executeOne<{ count: string }>(query, parameters);
        return result ? parseInt(result.count, 10) : 0;
    }

    /**
     * Find all records
     */
    async findAll(): Promise<T[]> {
        const query = `SELECT * FROM ${this.getTableName()} WHERE deleted_at IS NULL ORDER BY created_at DESC`;
        this.logger.debug(`[findAll] Executing query: ${query}`);
        try {
            const results = await this.execute<T>(query);
            this.logger.debug(`[findAll] Found ${results.length} records`);
            return results;
        } catch (error) {
            this.logger.error(`[findAll] Error executing query: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : '');
            throw error;
        }
    }

    /**
     * Find by ID
     */
    async findById(id: string | number): Promise<T | null> {
        const query = `SELECT * FROM ${this.getTableName()} WHERE id = $1 AND deleted_at IS NULL LIMIT 1`;
        return this.executeOne<T>(query, [id]);
    }

    /**
     * Find with pagination
     */
    async findPaginated(
        limit: number = 10,
        offset: number = 0,
        orderBy: string = 'created_at',
        orderDirection: 'ASC' | 'DESC' = 'DESC',
    ): Promise<{ data: T[]; total: number }> {
        const countQuery = `SELECT COUNT(*) as count FROM ${this.getTableName()} WHERE deleted_at IS NULL`;
        const dataQuery = `SELECT * FROM ${this.getTableName()} WHERE deleted_at IS NULL ORDER BY ${orderBy} ${orderDirection} LIMIT $1 OFFSET $2`;

        const [total, data] = await Promise.all([
            this.executeCount(countQuery),
            this.execute<T>(dataQuery, [limit, offset]),
        ]);

        return { data, total };
    }

    /**
     * Count all records
     */
    async count(): Promise<number> {
        const query = `SELECT COUNT(*) as count FROM ${this.getTableName()} WHERE deleted_at IS NULL`;
        return this.executeCount(query);
    }

    /**
     * Check if record exists by ID
     */
    async exists(id: string | number): Promise<boolean> {
        const query = `SELECT EXISTS(SELECT 1 FROM ${this.getTableName()} WHERE id = $1 AND deleted_at IS NULL)`;
        const result = await this.executeOne<{ exists: boolean }>(query, [id]);
        return result?.exists ?? false;
    }

    /**
     * Get records by condition
     */
    async findBy(conditions: Record<string, any>, limit?: number): Promise<T[]> {
        const where = Object.entries(conditions)
            .map(([key], index) => `"${key}" = $${index + 1}`)
            .join(' AND ');
        const values = Object.values(conditions);

        const limitClause = limit ? ` LIMIT ${limit}` : '';
        const query = `SELECT * FROM ${this.getTableName()} WHERE ${where} AND deleted_at IS NULL${limitClause}`;
        return this.execute<T>(query, values);
    }

    /**
     * Get single record by condition
     */
    async findOneBy(conditions: Record<string, any>): Promise<T | null> {
        const records = await this.findBy(conditions, 1);
        return records.length > 0 ? records[0] : null;
    }

    /**
     * Create a new record
     */
    async create(data: Partial<T>): Promise<T> {
        const columns = Object.keys(data);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const values = Object.values(data);

        const query = `INSERT INTO ${this.getTableName()} (${columns.map(c => `"${c}"`).join(', ')}, created_at, updated_at) 
                     VALUES (${placeholders}, NOW(), NOW()) 
                     RETURNING *`;
        return this.executeOne<T>(query, values) as Promise<T>;
    }

    /**
     * Update record by ID
     */
    async update(id: string | number, data: Partial<T>): Promise<T | null> {
        const columns = Object.keys(data);
        const setClause = columns.map((col, i) => `"${col}" = $${i + 1}`).join(', ');
        const values = [...Object.values(data), id];

        const query = `UPDATE ${this.getTableName()} SET ${setClause}, updated_at = NOW() WHERE id = $${columns.length + 1} AND deleted_at IS NULL RETURNING *`;
        return this.executeOne<T>(query, values);
    }

    /**
     * Soft delete record (mark as deleted)
     */
    async delete(id: string | number): Promise<boolean> {
        const query = `UPDATE ${this.getTableName()} SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL`;
        const result = await this.dataSource.query(query, [id]);
        return result.rowCount > 0;
    }

    /**
     * Hard delete record (permanent)
     */
    async hardDelete(id: string | number): Promise<boolean> {
        const query = `DELETE FROM ${this.getTableName()} WHERE id = $1`;
        const result = await this.dataSource.query(query, [id]);
        return result.rowCount > 0;
    }

    /**
     * Bulk create records
     */
    async createMany(data: Partial<T>[]): Promise<T[]> {
        if (data.length === 0) return [];

        const columns = Object.keys(data[0]);
        const valueSets = data
            .map((item, itemIndex) =>
                `(${columns.map((_, colIndex) => `$${itemIndex * columns.length + colIndex + 1}`).join(', ')})`
            )
            .join(', ');

        const values = data.flatMap(item => Object.values(item));
        const query = `INSERT INTO ${this.getTableName()} (${columns.map(c => `"${c}"`).join(', ')}, created_at, updated_at) 
                     VALUES ${valueSets}, (NOW(), NOW()) 
                     RETURNING *`;
        return this.execute<T>(query, values);
    }

    /**
     * Transaction helper
     */
    async transaction<R>(
        callback: (repository: this) => Promise<R>,
    ): Promise<R> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const result = await callback(this);
            await queryRunner.commitTransaction();
            return result;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Query builder for complex queries
     */
    query(): QueryBuilder {
        return new QueryBuilder(this.dataSource, this.getTableName());
    }
}

/**
 * Simple query builder for fluent SQL building
 */
export class QueryBuilder {
    private selectCols: string[] = ['*'];
    private whereClauses: Array<{ condition: string; params: any[] }> = [];
    private orderByClauses: string[] = [];
    private limitValue?: number;
    private offsetValue?: number;
    private joinClauses: string[] = [];

    constructor(
        private dataSource: DataSource,
        private tableName: string,
    ) {}

    /**
     * SELECT specific columns
     */
    select(...columns: string[]): this {
        this.selectCols = columns;
        return this;
    }

    /**
     * Add WHERE clause
     */
    where(condition: string, params: any[] = []): this {
        this.whereClauses.push({ condition, params });
        return this;
    }

    /**
     * Add ORDER BY clause
     */
    orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
        this.orderByClauses.push(`${column} ${direction}`);
        return this;
    }

    /**
     * Add LIMIT clause
     */
    limit(limit: number): this {
        this.limitValue = limit;
        return this;
    }

    /**
     * Add OFFSET clause
     */
    offset(offset: number): this {
        this.offsetValue = offset;
        return this;
    }

    /**
     * Add JOIN clause
     */
    join(joinClause: string): this {
        this.joinClauses.push(joinClause);
        return this;
    }

    /**
     * Build and execute query
     */
    async execute<T = any>(): Promise<T[]> {
        return this.buildAndExecute<T>();
    }

    /**
     * Build and execute query, return single result
     */
    async executeOne<T = any>(): Promise<T | null> {
        const results = await this.buildAndExecute<T>();
        return results.length > 0 ? results[0] : null;
    }

    /**
     * Build SQL query string
     */
    private buildQuery(): { query: string; params: any[] } {
        let query = `SELECT ${this.selectCols.join(', ')} FROM ${this.tableName}`;

        // Add JOINs
        if (this.joinClauses.length > 0) {
            query += ` ${this.joinClauses.join(' ')}`;
        }

        // Add WHERE clauses
        const allParams: any[] = [];
        if (this.whereClauses.length > 0) {
            const conditions = this.whereClauses.map(({ condition, params }) => {
                allParams.push(...params);
                return condition;
            });
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        // Add ORDER BY
        if (this.orderByClauses.length > 0) {
            query += ` ORDER BY ${this.orderByClauses.join(', ')}`;
        }

        // Add LIMIT
        if (this.limitValue !== undefined) {
            query += ` LIMIT ${this.limitValue}`;
        }

        // Add OFFSET
        if (this.offsetValue !== undefined) {
            query += ` OFFSET ${this.offsetValue}`;
        }

        return { query, params: allParams };
    }

    /**
     * Build and execute the query
     */
    private async buildAndExecute<T = any>(): Promise<T[]> {
        const { query, params } = this.buildQuery();
        return this.dataSource.query(query, params);
    }
}
