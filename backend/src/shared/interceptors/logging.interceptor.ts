/**
 * Logging Interceptor
 * Logs all HTTP requests and responses
 */

import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const { method, path, ip } = request;
        const startTime = Date.now();

        this.logger.log(`→ ${method} ${path} from ${ip}`);

        return next.handle().pipe(
            tap(() => {
                const duration = Date.now() - startTime;
                const statusCode = response.statusCode;

                this.logger.log(
                    `← ${method} ${path} ${statusCode} ${duration}ms`,
                );
            }),
            catchError((error) => {
                const duration = Date.now() - startTime;

                this.logger.error(
                    `✗ ${method} ${path} ${error.status || 500} ${duration}ms: ${error.message}`,
                );

                throw error;
            }),
        );
    }
}
