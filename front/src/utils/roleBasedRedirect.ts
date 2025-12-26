/**
 * Get the default landing page route based on user roles
 * @param roles - Array of role names
 * @returns The default route path for the user
 */
export const getDefaultRouteByRole = (roles?: string[]): string => {
    if (!roles || roles.length === 0) {
        // Fallback if no roles - redirect to signin
        return '/signin';
    }

    // Admin has full access - go to MROI dashboard
    if (roles.includes('admin')) {
        return '/mroi';
    }

    // MIOC role - go to MIOC dashboard
    if (roles.includes('mioc')) {
        return '/mioc-dashboard';
    }

    // Service role - go to MROI dashboard (one of service's main pages)
    if (roles.includes('service')) {
        return '/mroi';
    }

    // Unknown role - redirect to signin
    return '/signin';
};
