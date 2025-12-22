/**
 * Robot Module Type Definitions
 * Defines all types and interfaces for robot-related operations
 */

export type RobotStatus = 'active' | 'inactive' | 'maintenance' | 'offline';

export interface IRobot {
    vin: string;
    name: string;
    display_name?: string;
    workspace_id?: string;
    site?: string;
    active: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date | null;
}

export interface IRobotCreate {
    vin: string;
    name: string;
    display_name?: string;
    workspace_id?: string;
    site?: string;
    active?: boolean;
}

export interface IRobotUpdate {
    name?: string;
    display_name?: string;
    site?: string;
    active?: boolean;
}

export interface IRobotFilter {
    search?: string;
    workspace_id?: string;
    site?: string;
    active?: boolean;
    sortBy?: 'name' | 'vin' | 'created_at' | 'updated_at';
    sortOrder?: 'ASC' | 'DESC';
    limit?: number;
    offset?: number;
}

export interface IRobotQueryResult {
    data: IRobot[];
    total: number;
    limit: number;
    offset: number;
}

export interface IRobotResponse {
    vin: string;
    name: string;
    display_name?: string;
    workspace_id?: string;
    site?: string;
    active: boolean;
    created_at: Date;
    updated_at: Date;
}
