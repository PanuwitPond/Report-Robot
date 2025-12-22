/**
 * Robot DTOs (Data Transfer Objects)
 * Used for request/response validation
 */

import { IsString, IsOptional, IsBoolean, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

/**
 * DTO for creating a new robot
 */
export class CreateRobotDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    vin: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(255)
    name: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    display_name?: string;

    @IsString()
    @IsOptional()
    workspace_id?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    site?: string;

    @IsBoolean()
    @IsOptional()
    active?: boolean = true;
}

/**
 * DTO for updating an existing robot
 */
export class UpdateRobotDto {
    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(255)
    name?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    display_name?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    workspace_id?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    site?: string;

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}

/**
 * DTO for robot response
 */
export class RobotDto {
    vin: string;
    name: string;
    display_name?: string;
    workspace_id?: string;
    site?: string;
    active: boolean;
    created_at: Date;
    updated_at: Date;

    constructor(data: any) {
        this.vin = data.vin;
        this.name = data.name;
        this.display_name = data.display_name;
        this.workspace_id = data.workspace_id;
        this.site = data.site;
        this.active = data.active;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }
}

/**
 * DTO for paginated response
 */
export class PaginatedRobotsDto {
    data: RobotDto[];
    total: number;
    limit: number;
    offset: number;
    page?: number;
    pages?: number;

    constructor(data: RobotDto[], total: number, limit: number, offset: number) {
        this.data = data;
        this.total = total;
        this.limit = limit;
        this.offset = offset;
        this.page = Math.floor(offset / limit) + 1;
        this.pages = Math.ceil(total / limit);
    }
}
