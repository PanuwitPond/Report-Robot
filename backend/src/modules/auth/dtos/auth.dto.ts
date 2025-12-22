/**
 * Auth Module DTOs
 */

import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

/**
 * DTO for login request
 */
export class LoginDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}

/**
 * DTO for refresh token request
 */
export class RefreshTokenDto {
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}

/**
 * DTO for change password request
 */
export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty()
    currentPassword: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    newPassword: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    confirmPassword: string;
}

/**
 * DTO for auth response
 */
export class AuthResponseDto {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    tokenType: string = 'Bearer';
    user: {
        id: string;
        username: string;
        email: string;
        firstName?: string;
        lastName?: string;
        roles: string[];
    };

    constructor(data: any) {
        this.accessToken = data.accessToken;
        this.refreshToken = data.refreshToken;
        this.expiresIn = data.expiresIn;
        this.tokenType = data.tokenType || 'Bearer';
        this.user = data.user;
    }
}
