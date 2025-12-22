/**
 * Auth Module Type Definitions
 */

export interface JwtPayload {
    sub: string;
    username: string;
    email: string;
    roles: string[];
    iat?: number;
    exp?: number;
}

export interface AuthenticatedUser {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
}

export interface TokenResponse {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    tokenType: string;
}

export interface LoginResponse extends TokenResponse {
    user: AuthenticatedUser;
}

export interface AuthConfig {
    jwtSecret: string;
    jwtExpiration: number;
    jwtRefreshExpiration?: number;
    keycloakUrl?: string;
    keycloakRealm?: string;
}
