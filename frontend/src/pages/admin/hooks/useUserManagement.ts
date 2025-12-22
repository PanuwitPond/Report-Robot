/**
 * useUserManagement Hook
 * Handles user and role management CRUD operations
 */

import { useState, useCallback } from 'react';
import { usersService } from '@/services';
import { UserManagementState } from '../types/admin.types';
import { ADMIN_MESSAGES } from '../constants/admin.constants';

export const useUserManagement = () => {
    const [state, setState] = useState<UserManagementState>({
        users: [],
        availableRoles: [],
        isLoading: true,
        error: null
    });

    // Load all users
    const loadUsers = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, error: null, isLoading: true }));
            const data = await usersService.getAllUsers();
            setState(prev => ({ ...prev, users: data, isLoading: false }));
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || ADMIN_MESSAGES.LOAD_ERROR;
            setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
        }
    }, []);

    // Load available roles
    const loadAvailableRoles = useCallback(async () => {
        try {
            const roles = await usersService.getAvailableRoles();
            setState(prev => ({ ...prev, availableRoles: roles }));
        } catch (err: any) {
            console.error('Failed to load available roles:', err);
            setState(prev => ({ ...prev, availableRoles: [] }));
        }
    }, []);

    // Assign role to user
    const assignRole = useCallback(
        async (userId: string, roleName: string) => {
            try {
                await usersService.assignRole(userId, roleName);
                await loadUsers();
                return { success: true };
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || ADMIN_MESSAGES.ASSIGN_ROLE_ERROR;
                return { success: false, message: errorMsg };
            }
        },
        [loadUsers]
    );

    // Remove role from user
    const removeRole = useCallback(
        async (userId: string, roleName: string) => {
            const adminCount = state.users.filter(u => u.roles.includes('admin')).length;

            if (roleName === 'admin' && adminCount <= 1) {
                return { success: false, message: ADMIN_MESSAGES.REMOVE_LAST_ADMIN };
            }

            try {
                await usersService.removeRole(userId, roleName);
                await loadUsers();
                return { success: true };
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || ADMIN_MESSAGES.REMOVE_ROLE_ERROR;
                return { success: false, message: errorMsg };
            }
        },
        [state.users, loadUsers]
    );

    // Create new user
    const createUser = useCallback(
        async (
            username: string,
            email: string,
            firstName: string,
            lastName: string,
            password: string,
            emailVerified: boolean
        ) => {
            try {
                await usersService.addUser(username, email, firstName, lastName, password, emailVerified);
                await loadUsers();
                return { success: true, message: ADMIN_MESSAGES.CREATE_USER_SUCCESS };
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || ADMIN_MESSAGES.CREATE_USER_ERROR;
                return { success: false, message: errorMsg };
            }
        },
        [loadUsers]
    );

    return {
        // State
        users: state.users,
        availableRoles: state.availableRoles,
        isLoading: state.isLoading,
        error: state.error,

        // Methods
        loadUsers,
        loadAvailableRoles,
        assignRole,
        removeRole,
        createUser
    };
};
