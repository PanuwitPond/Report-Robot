/**
 * Role-Based Menu Access Configuration
 * Defines which menu items each role can access
 * 
 * Actual Keycloak Roles:
 * - admin: Full access to all menus
 * - mioc: Access to MIOC menu only
 * - service: Access to METTPOLE, METTBOT, MROI menus
 */

export const ROLE_MENU_ACCESS = {
    admin: ['pole', 'bot', 'mioc', 'mroi'] as const,      // All 4 menus
    mioc: ['mioc'] as const,                               // MIOC only
    service: ['pole', 'bot', 'mroi'] as const,             // METTPOLE, METTBOT, MROI
} as const;

export type MenuType = 'pole' | 'bot' | 'mioc' | 'mroi';
export type UserRole = 'admin' | 'mioc' | 'service';

/**
 * Get accessible menus for a given role
 */
export const getAccessibleMenus = (role?: string): MenuType[] => {
    if (!role) return [];
    
    const menuAccess = ROLE_MENU_ACCESS[role as UserRole];
    return menuAccess ? Array.from(menuAccess) : [];
};

/**
 * Check if a role can access a specific menu
 */
export const canAccessMenu = (role: string | undefined, menu: MenuType): boolean => {
    if (!role) return false;
    
    const accessibleMenus = getAccessibleMenus(role);
    return accessibleMenus.includes(menu);
};

/**
 * Role-Based Route Access Configuration
 * Defines which routes each role can access
 * 
 * admin: All routes (full access)
 * mioc: MIOC menu routes only
 * service: METTPOLE, METTBOT, MROI routes (no MIOC, no Admin)
 */
export const ROLE_ROUTE_ACCESS = {
    admin: [
        // METTPOLE routes
        '/download-report',
        '/report-task-config',
        '/task-editor',
        '/add-image',
        '/report-image-config',
        // METTBOT routes
        '/robots',
        '/robot-cleaning-report',
        '/workforce',
        // MIOC routes
        '/mioc-dashboard',
        // Admin routes
        '/admin/manage-roles',
    ] as const,
    mioc: [
        // MIOC routes ONLY
        '/mioc-dashboard',
    ] as const,
    service: [
        // METTPOLE routes
        '/download-report',
        '/report-task-config',
        '/task-editor',
        '/add-image',
        '/report-image-config',
        // METTBOT routes
        '/robots',
        '/robot-cleaning-report',
        '/workforce',
    ] as const,
} as const;

/**
 * Get accessible routes for a given role
 */
export const getAccessibleRoutes = (role?: string): readonly string[] => {
    if (!role) return [];
    
    const routeAccess = ROLE_ROUTE_ACCESS[role as UserRole];
    return routeAccess ? routeAccess : [];
};

/**
 * Check if a role can access a specific route
 */
export const canAccessRoute = (role: string | undefined, route: string): boolean => {
    if (!role) return false;
    
    const accessibleRoutes = getAccessibleRoutes(role);
    return accessibleRoutes.includes(route as any);
};

/**
 * Get required roles for a specific route
 * Returns array of roles that CAN access this route
 */
export const getRequiredRolesForRoute = (route: string): UserRole[] => {
    const roles: UserRole[] = [];
    
    for (const [role, routes] of Object.entries(ROLE_ROUTE_ACCESS)) {
        if (routes.includes(route as never)) {
            roles.push(role as UserRole);
        }
    }
    
    return roles;
};
