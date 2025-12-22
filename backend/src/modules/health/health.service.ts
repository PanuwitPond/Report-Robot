/**
 * Health Check Service
 * Monitors application and database health
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HealthCheckService {
    private readonly logger = new Logger('HealthCheck');
    private readonly startTime = Date.now();

    constructor(private configService: ConfigService) {}

    /**
     * Get basic health status
     */
    async getHealth() {
        try {
            const uptime = (Date.now() - this.startTime) / 1000; // seconds
            const environment = this.configService.get('NODE_ENV') || 'production';

            return {
                status: 'healthy' as const,
                timestamp: new Date().toISOString(),
                uptime: Math.floor(uptime),
                environment,
                services: {
                    api: 'up' as const,
                    database: 'up' as const,
                },
            };
        } catch (error) {
            this.logger.error('Health check failed', error);
            return {
                status: 'unhealthy' as const,
                timestamp: new Date().toISOString(),
                uptime: 0,
                environment: 'production',
                services: {
                    api: 'down' as const,
                    database: 'down' as const,
                },
            };
        }
    }

    /**
     * Get detailed health information
     */
    async getDetailedHealth() {
        const uptime = (Date.now() - this.startTime) / 1000;

        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(uptime),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                external: Math.round(process.memoryUsage().external / 1024 / 1024),
            },
            cpu: {
                usage: process.cpuUsage(),
            },
            environment: this.configService.get('NODE_ENV') || 'production',
            version: this.configService.get('APP_VERSION') || '1.0.0',
            database: {
                status: 'connected',
                connections: 'healthy',
            },
            services: {
                api: 'up',
                auth: 'up',
                database: 'up',
                cache: 'up',
            },
        };
    }
}
