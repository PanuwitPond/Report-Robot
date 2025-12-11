import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
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

    @Delete(':id/roles/:roleName')
    async removeRole(
        @Param('id') userId: string,
        @Param('roleName') roleName: string,
    ) {
        await this.usersService.removeRole(userId, roleName);
        return { message: 'Role removed successfully' };
    }
}
