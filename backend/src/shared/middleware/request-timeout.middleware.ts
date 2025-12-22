/**
 * Request Timeout Middleware
 * Sets timeout for all incoming requests
 */

import { Injectable, NestMiddleware, RequestTimeoutException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestTimeoutMiddleware implements NestMiddleware {
    private readonly defaultTimeout = 30000; // 30 seconds

    use(req: Request, res: Response, next: NextFunction) {
        const timeout = this.getTimeoutForRoute(req.path);

        // Set response timeout
        res.setTimeout(timeout, () => {
            res.status(408).json({
                success: false,
                error: {
                    status: 408,
                    message: 'Request Timeout',
                },
                timestamp: new Date().toISOString(),
                path: req.path,
            });
        });

        next();
    }

    /**
     * Get timeout duration based on route
     */
    private getTimeoutForRoute(path: string): number {
        // File operations need more time
        if (path.includes('/upload') || path.includes('/download') || path.includes('/export')) {
            return 120000; // 2 minutes
        }

        // Auth operations
        if (path.includes('/auth')) {
            return 10000; // 10 seconds
        }

        // Default timeout
        return this.defaultTimeout;
    }
}
