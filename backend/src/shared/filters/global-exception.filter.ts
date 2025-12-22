/**
 * Global Exception Filter
 * Handles all exceptions and formats them consistently
 */

import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponse {
    success: boolean;
    error: {
        status: number;
        message: string;
        details?: any;
    };
    timestamp: string;
    path?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger('GlobalExceptionFilter');

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let details: any = undefined;

        // Handle HttpException (NestJS exceptions)
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            // If response is object with message, use it
            if (typeof exceptionResponse === 'object') {
                const { message: msg, error } = exceptionResponse as any;
                message = msg || error || 'HTTP Exception';
                details = exceptionResponse;
            } else {
                message = exceptionResponse as string;
            }
        } else if (exception instanceof Error) {
            // Handle standard Error
            message = exception.message;
            this.logger.error(
                `Error: ${message}`,
                exception.stack,
            );
        } else {
            // Handle unknown error
            this.logger.error('Unknown error:', exception);
        }

        // Log error
        this.logger.warn(`
            ${request.method} ${request.path}
            Status: ${status}
            Message: ${message}
            IP: ${request.ip}
        `);

        // Format and send response
        const errorResponse: ErrorResponse = {
            success: false,
            error: {
                status,
                message,
                ...(process.env.NODE_ENV === 'development' && { details }),
            },
            timestamp: new Date().toISOString(),
            path: request.path,
        };

        response.status(status).json(errorResponse);
    }
}
