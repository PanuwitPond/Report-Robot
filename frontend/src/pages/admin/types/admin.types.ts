/**
 * Admin/User Management Types
 */

export interface UserWithRoles {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
}

export interface AddUserFormData {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
}

export interface UserManagementState {
    users: UserWithRoles[];
    availableRoles: string[];
    isLoading: boolean;
    error: string | null;
}

export type AddUserStep = 1 | 2;
