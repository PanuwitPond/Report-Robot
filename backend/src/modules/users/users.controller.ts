import { Controller, Get, Post, Delete, Param, Body, UseGuards, Put, Req, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin') // All endpoints require admin role
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async getAllUsers() {
        return this.usersService.getAllUsers();
    }

    @Get('available-roles')
    async getAvailableRoles() {
        return this.usersService.getAvailableRoles();
    }

    @Post(':id/roles')
    async assignRole(
        @Param('id') userId: string,
        @Body('roleName') roleName: string,
    ) {
        await this.usersService.assignRole(userId, roleName);
        return { message: 'Role assigned successfully' };
    }

    @Post()
    async createUser(@Body() body: any) {
        const id = await this.usersService.createUser(body);
        return { id, message: 'User created successfully' };
    }

    @Put(':id/credentials')
    async setCredentials(
        @Param('id') userId: string,
        @Body() body: { password: string; temporary?: boolean },
    ) {
        await this.usersService.setUserPassword(userId, body.password, !!body.temporary);
        return { message: 'Password set successfully' };
    }

    @Delete(':id')
    async deleteUser(
        @Param('id') userId: string,
        @Body() body: { confirmUsername: string; adminPassword: string },
        @Req() req: Request,
    ) {
        // Basic validation
        if (!body?.confirmUsername || !body?.adminPassword) {
            throw new BadRequestException('Missing confirmation or admin password');
        }

        // Ensure target exists
        const users = await this.usersService.getAllUsers();
        const target = users.find(u => u.id === userId);
        if (!target) {
            throw new BadRequestException('User not found');
        }

        // Verify the admin's identity: provided confirmUsername must match the requester
        const requester = (req as any).user;
        const requesterUsername = (requester?.preferred_username || requester?.username || requester?.sub || '').trim();
        if (!requesterUsername) {
            throw new BadRequestException('Unable to determine requester username');
        }
        if (requesterUsername.trim().toLowerCase() !== (body.confirmUsername || '').trim().toLowerCase()) {
            throw new BadRequestException('Confirmation admin username does not match the currently authenticated admin');
        }

        const ok = await this.usersService.verifyUserPassword(requesterUsername, body.adminPassword);
        if (!ok) {
            throw new BadRequestException('Invalid admin password');
        }

        // Perform soft-disable
        await this.usersService.disableUser(userId);
        return { message: 'User disabled successfully' };
    }

    @Delete(':id/roles/:roleName')
    async removeRole(
        @Param('id') userId: string,
        @Param('roleName') roleName: string,
    ) {
        await this.usersService.removeRole(userId, roleName);
        return { message: 'Role removed successfully' };
    }
}
