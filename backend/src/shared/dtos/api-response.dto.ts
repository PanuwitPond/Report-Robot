/**
 * Shared Response DTOs
 * Standardized response structures for all APIs
 */

export class ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: Date;

    constructor(data?: T, message?: string, error?: string) {
        this.success = !error;
        this.data = data;
        this.message = message || (error ? undefined : 'Success');
        this.error = error;
        this.timestamp = new Date();
    }
}

export class PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        page: number;
        pages: number;
    };
    message?: string;
    timestamp: Date;

    constructor(
        data: T[],
        total: number,
        limit: number,
        offset: number,
        message?: string,
    ) {
        this.success = true;
        this.data = data;
        this.pagination = {
            total,
            limit,
            offset,
            page: Math.floor(offset / limit) + 1,
            pages: Math.ceil(total / limit),
        };
        this.message = message || 'Success';
        this.timestamp = new Date();
    }
}

export class ErrorResponse {
    success: boolean = false;
    error: string;
    message?: string;
    statusCode: number;
    timestamp: Date;

    constructor(error: string, statusCode: number, message?: string) {
        this.error = error;
        this.statusCode = statusCode;
        this.message = message;
        this.timestamp = new Date();
    }
}
