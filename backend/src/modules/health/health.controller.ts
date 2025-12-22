/**
 * Health Check Controller
 * Provides health status endpoints for monitoring
 */

import { Controller, Get } from '@nestjs/common';
import { HealthCheckService } from './health.service';

interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    environment: string;
    services: {
        api: 'up' | 'down';
        database: 'up' | 'down';
    };
}

@Controller('health')
export class HealthCheckController {
    constructor(private healthCheckService: HealthCheckService) {}

    /**
     * Basic health check - returns UP if service is running
     */
    @Get()
    async checkHealth(): Promise<HealthStatus> {
        return this.healthCheckService.getHealth();
    }

    /**
     * Detailed health check - checks all dependencies
     */
    @Get('detailed')
    async checkDetailedHealth(): Promise<any> {
        return this.healthCheckService.getDetailedHealth();
    }

    /**
     * Readiness check - used by orchestration platforms
     */
    @Get('ready')
    async checkReadiness(): Promise<{ ready: boolean }> {
        const health = await this.healthCheckService.getHealth();
        return { ready: health.status !== 'unhealthy' };
    }

    /**
     * Liveness check - used by orchestration platforms
     */
    @Get('live')
    async checkLiveness(): Promise<{ alive: boolean }> {
        return { alive: true };
    }
}
