/**
 * Response Interceptor
 * Standardizes all API responses to a consistent format
 * Excludes auth endpoints to maintain compatibility
 */

import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T = any> implements NestInterceptor<T, any> {
    // Endpoints that should NOT be wrapped
    private readonly excludedPaths = [
        '/auth/login',
        '/auth/refresh',
        '/auth/logout',
    ];

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const path = request.path;
        const method = request.method;

        // Check if this path should be excluded
        const isExcluded = this.excludedPaths.some(excludedPath =>
            path.includes(excludedPath),
        );

        return next.handle().pipe(
            map((data) => {
                // Don't wrap excluded paths
                if (isExcluded) {
                    return data;
                }

                // If response already has success property, return as-is
                if (data && typeof data === 'object' && 'success' in data) {
                    return data;
                }

                // Wrap response in standard format
                return {
                    success: true,
                    data: data || null,
                    message: `${method} ${path} executed successfully`,
                    timestamp: new Date().toISOString(),
                };
            }),
        );
    }
}
