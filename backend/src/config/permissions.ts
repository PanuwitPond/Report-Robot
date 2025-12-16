export const rolePermissions: Record<string, string[]> = {
    // Admin wildcard: full access to everything
    admin: ['*'],

    // MIOC: only access to MIOC menu and APIs
    mioc: [
        'menu.mioc',
        'api.mioc.*',
    ],

    // Service: access to Mettbot, Mettpole, and MROI menus and APIs
    service: [
        'menu.mettbot',
        'api.mettbot.*',
        'menu.mettpole',
        'api.mettpole.*',
        'menu.mroi',
        'api.mroi.*',
    ],
};

export default rolePermissions;
