/**
 * User Module Type Definitions
 */

export type UserRole = 'admin' | 'user' | 'operator' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface IUser {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    enabled: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserProfile extends IUser {
    roles: IRole[];
    attributes?: Record<string, string[]>;
}

export interface IRole {
    id: string;
    name: string;
    description?: string;
    composite: boolean;
    clientRole: boolean;
    containerId?: string;
}

export interface IUserCreate {
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    password: string;
    enabled?: boolean;
    roles?: string[];
}

export interface IUserUpdate {
    email?: string;
    firstName?: string;
    lastName?: string;
    enabled?: boolean;
}

export interface IUserFilter {
    search?: string;
    enabled?: boolean;
    role?: string;
    limit?: number;
    offset?: number;
}

export interface IUserRoleAssignment {
    userId: string;
    roleId: string;
    roleName: string;
}
