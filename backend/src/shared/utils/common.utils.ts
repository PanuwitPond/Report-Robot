/**
 * Shared Utilities
 * Common helper functions used across the application
 */

/**
 * Parse pagination parameters
 */
export function parsePagination(limit?: any, offset?: any) {
    let parsedLimit = parseInt(limit, 10) || 10;
    let parsedOffset = parseInt(offset, 10) || 0;

    // Validate ranges
    parsedLimit = Math.min(Math.max(parsedLimit, 1), 1000); // 1-1000
    parsedOffset = Math.max(parsedOffset, 0);

    return {
        limit: parsedLimit,
        offset: parsedOffset,
        page: Math.floor(parsedOffset / parsedLimit) + 1,
    };
}

/**
 * Extract pagination from query
 */
export function extractPaginationFromQuery(query: any) {
    return parsePagination(query.limit, query.offset);
}

/**
 * Safely parse JSON string
 */
export function safeJsonParse<T = any>(jsonString: string, fallback?: T): T | null {
    try {
        return JSON.parse(jsonString) as T;
    } catch {
        return fallback ?? null;
    }
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as any;
    if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
    if (obj instanceof Object) {
        const clonedObj = {} as T;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
    return obj;
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
    return (
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '') ||
        (typeof value === 'object' && Object.keys(value).length === 0) ||
        (Array.isArray(value) && value.length === 0)
    );
}

/**
 * Remove empty values from object
 */
export function removeEmpty<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => !isEmpty(v)),
    ) as Partial<T>;
}

/**
 * Retry promise with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    initialDelay: number = 1000,
): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (attempt < maxAttempts - 1) {
                const delay = initialDelay * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError || new Error('All retry attempts failed');
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = ''): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}_${timestamp}${randomStr}` : `${timestamp}${randomStr}`;
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * Math.pow(10, dm)) / Math.pow(10, dm) + ' ' + sizes[i];
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get value from nested object using dot notation
 */
export function getNestedValue(obj: any, path: string, fallback?: any): any {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
        value = value?.[key];
        if (value === undefined) return fallback;
    }

    return value;
}

/**
 * Set value in nested object using dot notation
 */
export function setNestedValue(obj: any, path: string, value: any): any {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current) || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    return obj;
}
