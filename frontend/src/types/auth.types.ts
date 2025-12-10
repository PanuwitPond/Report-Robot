// Domain types
export type Domain = 'METTBOT' | 'METTPOLE';

export type UserRole = 'ADMIN' | 'METTBOT_USER' | 'METTPOLE_USER';

// User types
export interface User {
    id: string;
    username: string;
    email: string;
    roles: UserRole[];
    domain?: Domain;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}
