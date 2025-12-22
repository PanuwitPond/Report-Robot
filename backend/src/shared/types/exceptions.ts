/**
 * Shared Exception Types
 * Defines custom exceptions for the application
 */

import { HttpException, HttpStatus } from '@nestjs/common';

export class ResourceNotFoundException extends HttpException {
    constructor(resource: string, identifier: string) {
        super(
            `${resource} with identifier "${identifier}" not found`,
            HttpStatus.NOT_FOUND,
        );
    }
}

export class ResourceConflictException extends HttpException {
    constructor(resource: string, field: string, value: string) {
        super(
            `${resource} with ${field} "${value}" already exists`,
            HttpStatus.CONFLICT,
        );
    }
}

export class InvalidInputException extends HttpException {
    constructor(message: string) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}

export class UnauthorizedException extends HttpException {
    constructor(message: string = 'Unauthorized access') {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}

export class ForbiddenException extends HttpException {
    constructor(message: string = 'Forbidden') {
        super(message, HttpStatus.FORBIDDEN);
    }
}

export class InternalServerException extends HttpException {
    constructor(message: string = 'Internal server error') {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
