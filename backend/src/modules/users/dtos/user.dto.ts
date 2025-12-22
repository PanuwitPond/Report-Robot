/**
 * User Module DTOs
 */

import { IsString, IsEmail, IsOptional, IsNotEmpty, MinLength, MaxLength, IsBoolean } from 'class-validator';

/**
 * DTO for creating a new user
 */
export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(255)
    username: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    firstName?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    lastName?: string;

    @IsBoolean()
    @IsOptional()
    enabled?: boolean = true;

    @IsString({ each: true })
    @IsOptional()
    roles?: string[];
}

/**
 * DTO for updating an existing user
 */
export class UpdateUserDto {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    firstName?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    lastName?: string;

    @IsBoolean()
    @IsOptional()
    enabled?: boolean;
}

/**
 * DTO for assigning roles to a user
 */
export class AssignRoleDto {
    @IsString()
    @IsNotEmpty()
    roleId: string;

    @IsString()
    @IsNotEmpty()
    roleName: string;
}

/**
 * DTO for user response
 */
export class UserDto {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    enabled: boolean;
    roles?: Array<{ id: string; name: string }>;

    constructor(data: any) {
        this.id = data.id;
        this.username = data.username;
        this.email = data.email;
        this.firstName = data.firstName || data.first_name;
        this.lastName = data.lastName || data.last_name;
        this.enabled = data.enabled;
        this.roles = data.roles;
    }
}

/**
 * DTO for paginated user response
 */
export class PaginatedUsersDto {
    data: UserDto[];
    total: number;
    limit: number;
    offset: number;
    page?: number;
    pages?: number;

    constructor(data: UserDto[], total: number, limit: number, offset: number) {
        this.data = data;
        this.total = total;
        this.limit = limit;
        this.offset = offset;
        this.page = Math.floor(offset / limit) + 1;
        this.pages = Math.ceil(total / limit);
    }
}
