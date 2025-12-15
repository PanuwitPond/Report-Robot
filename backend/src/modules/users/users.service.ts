import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface KeycloakUser {
    id: string;
    username: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    enabled: boolean;
}

interface KeycloakRole {
    id: string;
    name: string;
}

@Injectable()
export class UsersService {
    private adminToken: string | null = null;
    private tokenExpiry: number = 0;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Get admin access token for Keycloak Admin API
     */
    private async getAdminToken(): Promise<string> {
        // Return cached token if still valid
        if (this.adminToken && Date.now() < this.tokenExpiry) {
            return this.adminToken;
        }

        try {
            const keycloakUrl = this.configService.get('KEYCLOAK_URL');
            const adminUsername = this.configService.get('KEYCLOAK_ADMIN_USERNAME');
            const adminPassword = this.configService.get('KEYCLOAK_ADMIN_PASSWORD');

            if (!adminUsername || !adminPassword) {
                throw new InternalServerErrorException('Keycloak admin credentials not configured');
            }

            const tokenUrl = `${keycloakUrl}/realms/master/protocol/openid-connect/token`;

            const params = new URLSearchParams();
            params.append('grant_type', 'password');
            params.append('client_id', 'admin-cli');
            params.append('username', adminUsername);
            params.append('password', adminPassword);

            const { data } = await firstValueFrom(
                this.httpService.post(tokenUrl, params.toString(), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }),
            );

            this.adminToken = data.access_token;
            // Set expiry to 5 minutes before actual expiry for safety
            this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

            return this.adminToken;
        } catch (error) {
            console.error('Failed to get Keycloak admin token:', error.response?.data || error.message);
            throw new InternalServerErrorException('Failed to authenticate with Keycloak Admin API');
        }
    }

    /**
     * Get all users from Keycloak realm
     */
    async getAllUsers(): Promise<any[]> {
        try {
            const token = await this.getAdminToken();
            const keycloakUrl = this.configService.get('KEYCLOAK_URL');
            const realm = this.configService.get('KEYCLOAK_REALM');

            const usersUrl = `${keycloakUrl}/admin/realms/${realm}/users?enabled=true`;

            const { data: users } = await firstValueFrom(
                this.httpService.get<KeycloakUser[]>(usersUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
            );

            // Filter out service accounts (exclude users whose username starts with 'service-account-')
            const regularUsers = users.filter(u => !u.username.startsWith('service-account-'));

            // Get roles for each user
            const usersWithRoles = await Promise.all(
                regularUsers.map(async (user) => {
                    const roles = await this.getUserRoles(user.id);
                    return {
                        id: user.id,
                        username: user.username,
                        email: user.email || '',
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        enabled: user.enabled,
                        roles: roles.map(r => r.name),
                    };
                }),
            );

            return usersWithRoles;
        } catch (error) {
            console.error('Failed to get users:', error.response?.data || error.message);
            throw new InternalServerErrorException('Failed to fetch users from Keycloak');
        }
    }

    /**
     * Get roles for a specific user
     */
    private async getUserRoles(userId: string): Promise<KeycloakRole[]> {
        try {
            const token = await this.getAdminToken();
            const keycloakUrl = this.configService.get('KEYCLOAK_URL');
            const realm = this.configService.get('KEYCLOAK_REALM');

            const rolesUrl = `${keycloakUrl}/admin/realms/${realm}/users/${userId}/role-mappings/realm`;

            const { data } = await firstValueFrom(
                this.httpService.get<KeycloakRole[]>(rolesUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
            );

            return data;
        } catch (error) {
            console.error(`Failed to get roles for user ${userId}:`, error.response?.data || error.message);
            return [];
        }
    }

    /**
     * Count users with admin role
     */
    async countAdmins(): Promise<number> {
        const users = await this.getAllUsers();
        return users.filter(user => user.roles.includes('admin')).length;
    }

    /**
     * Assign role to user
     */
    async assignRole(userId: string, roleName: string): Promise<void> {
        try {
            const token = await this.getAdminToken();
            const keycloakUrl = this.configService.get('KEYCLOAK_URL');
            const realm = this.configService.get('KEYCLOAK_REALM');

            // First, get the role object
            const roleUrl = `${keycloakUrl}/admin/realms/${realm}/roles/${roleName}`;
            const { data: role } = await firstValueFrom(
                this.httpService.get<KeycloakRole>(roleUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
            );

            // Assign role to user
            const assignUrl = `${keycloakUrl}/admin/realms/${realm}/users/${userId}/role-mappings/realm`;
            await firstValueFrom(
                this.httpService.post(assignUrl, [role], {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }),
            );
        } catch (error) {
            console.error('Failed to assign role:', error.response?.data || error.message);
            throw new BadRequestException('Failed to assign role to user');
        }
    }

    /**
     * Remove role from user
     */
    async removeRole(userId: string, roleName: string): Promise<void> {
        // Check if removing admin role
        if (roleName === 'admin') {
            const adminCount = await this.countAdmins();
            if (adminCount <= 1) {
                throw new BadRequestException('Cannot remove the last admin user');
            }
        }

        try {
            const token = await this.getAdminToken();
            const keycloakUrl = this.configService.get('KEYCLOAK_URL');
            const realm = this.configService.get('KEYCLOAK_REALM');

            // Get the role object
            const roleUrl = `${keycloakUrl}/admin/realms/${realm}/roles/${roleName}`;
            const { data: role } = await firstValueFrom(
                this.httpService.get<KeycloakRole>(roleUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
            );

            // Remove role from user
            const removeUrl = `${keycloakUrl}/admin/realms/${realm}/users/${userId}/role-mappings/realm`;
            await firstValueFrom(
                this.httpService.delete(removeUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    data: [role],
                }),
            );
        } catch (error) {
            console.error('Failed to remove role:', error.response?.data || error.message);
            throw new BadRequestException('Failed to remove role from user');
        }
    }

    /**
     * Get available roles from Keycloak realm (custom roles only)
     */
    async getAvailableRoles(): Promise<string[]> {
        try {
            const token = await this.getAdminToken();
            const keycloakUrl = this.configService.get('KEYCLOAK_URL');
            const realm = this.configService.get('KEYCLOAK_REALM');

            const rolesUrl = `${keycloakUrl}/admin/realms/${realm}/roles`;

            const { data: roles } = await firstValueFrom(
                this.httpService.get<KeycloakRole[]>(rolesUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
            );

            // Filter out system/default roles
            const systemRolePrefixes = ['default-roles-', 'offline_access', 'uma_authorization'];
            const customRoles = roles
                .filter(role => {
                    // Exclude roles that start with system prefixes
                    return !systemRolePrefixes.some(prefix => role.name.startsWith(prefix));
                })
                .map(role => role.name);

            return customRoles;
        } catch (error) {
            console.error('Failed to get available roles:', error.response?.data || error.message);
            throw new InternalServerErrorException('Failed to fetch available roles from Keycloak');
        }
    }

    /**
     * Create a new user in Keycloak realm and return created user id
     */
    async createUser(payload: Partial<KeycloakUser & { emailVerified?: boolean }>): Promise<string> {
        try {
            const token = await this.getAdminToken();
            const keycloakUrl = this.configService.get('KEYCLOAK_URL');
            const realm = this.configService.get('KEYCLOAK_REALM');

            const usersUrl = `${keycloakUrl}/admin/realms/${realm}/users`;

            const body = {
                username: payload.username,
                email: payload.email,
                firstName: payload.firstName,
                lastName: payload.lastName,
                emailVerified: payload.emailVerified || false,
                enabled: true,
            };

            const response = await firstValueFrom(
                this.httpService.post(usersUrl, body, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    validateStatus: () => true,
                }),
            );

            const status = (response as any).status;
            const headers = (response as any).headers || {};

            if (status === 201) {
                const location = headers['location'] || headers['Location'];
                const id = location ? location.split('/').pop() : null;
                if (!id) throw new InternalServerErrorException('Unable to determine created user id');
                return id;
            }

            console.error('Failed to create user:', (response as any).data || response);
            throw new BadRequestException(((response as any).data as any)?.error || 'Failed to create user in Keycloak');
        } catch (error) {
            console.error('Error creating user:', error.response?.data || error.message || error);
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException('Failed to create user');
        }
    }

    /**
     * Set or reset user password
     */
    async setUserPassword(userId: string, password: string, temporary = true): Promise<void> {
        try {
            const token = await this.getAdminToken();
            const keycloakUrl = this.configService.get('KEYCLOAK_URL');
            const realm = this.configService.get('KEYCLOAK_REALM');

            const resetUrl = `${keycloakUrl}/admin/realms/${realm}/users/${userId}/reset-password`;

            const body = {
                type: 'password',
                value: password,
                temporary,
            };

            await firstValueFrom(
                this.httpService.put(resetUrl, body, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }),
            );
        } catch (error) {
            console.error('Failed to set user password:', error.response?.data || error.message);
            if (error.response?.status === 400) {
                throw new BadRequestException(error.response.data || 'Password does not meet policy');
            }
            throw new InternalServerErrorException('Failed to set user password');
        }
    }

    /**
     * Verify given username/password by requesting token from Keycloak
     */
    async verifyUserPassword(username: string, password: string): Promise<boolean> {
        try {
            const keycloakUrl = this.configService.get('KEYCLOAK_URL');
            const realm = this.configService.get('KEYCLOAK_REALM');
            const clientId = this.configService.get('KEYCLOAK_CLIENT_ID');
            const clientSecret = this.configService.get('KEYCLOAK_CLIENT_SECRET');

            const tokenUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;

            const params = new URLSearchParams();
            params.append('grant_type', 'password');
            params.append('client_id', clientId || '');
            if (clientSecret) params.append('client_secret', clientSecret);
            params.append('username', username);
            params.append('password', password);

            const { data } = await firstValueFrom(
                this.httpService.post(tokenUrl, params.toString(), {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    validateStatus: () => true,
                }),
            );

            return !!data?.access_token;
        } catch (error) {
            console.error('Failed to verify user password:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Soft-disable a user (set enabled=false). Performs safety checks (admin count) when applicable.
     */
    async disableUser(userId: string): Promise<void> {
        try {
            const token = await this.getAdminToken();
            const keycloakUrl = this.configService.get('KEYCLOAK_URL');
            const realm = this.configService.get('KEYCLOAK_REALM');

            // Check if user has admin role and prevent deleting last admin
            const roles = await this.getUserRoles(userId);
            if (roles.map(r => r.name).includes('admin')) {
                const adminCount = await this.countAdmins();
                if (adminCount <= 1) {
                    throw new BadRequestException('Cannot delete the last admin user');
                }
            }

            const userUrl = `${keycloakUrl}/admin/realms/${realm}/users/${userId}`;
            // Soft-disable by updating enabled flag
            await firstValueFrom(
                this.httpService.put(userUrl, { enabled: false }, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                }),
            );

            // Log action (could be replaced with persistent audit log)
            console.log(`User ${userId} disabled by admin action`);
        } catch (error) {
            console.error('Failed to disable user:', error.response?.data || error.message);
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException('Failed to disable user');
        }
    }
}
