/**
 * Custom Decorators
 * Provides reusable decorators for common functionality
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @CurrentUser decorator
 * Extracts the current user from JWT token
 */
export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);

/**
 * @Ip decorator
 * Extracts the client IP address
 */
export const Ip = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.ip;
    },
);

/**
 * @UserAgent decorator
 * Extracts the user agent string
 */
export const UserAgent = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.get('user-agent');
    },
);

/**
 * @Public decorator
 * Marks a route as public (no auth required)
 */
export const Public = () => {
    return (target: any, key?: string | symbol, descriptor?: PropertyDescriptor) => {
        if (descriptor) {
            descriptor.value.isPublic = true;
        }
    };
};

/**
 * @Paginated decorator
 * Marks method as supporting pagination
 */
export const Paginated = () => {
    return (target: any, key?: string | symbol, descriptor?: PropertyDescriptor) => {
        if (descriptor) {
            descriptor.value.isPaginated = true;
        }
    };
};

/**
 * @Cached decorator
 * Marks method response for caching
 */
export const Cached = (ttl: number = 300) => {
    return (target: any, key?: string | symbol, descriptor?: PropertyDescriptor) => {
        if (descriptor) {
            descriptor.value.cacheTtl = ttl;
        }
    };
};
