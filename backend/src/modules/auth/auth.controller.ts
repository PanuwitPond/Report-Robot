import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() loginDto: { username: string; password: string }) {
        return this.authService.login(loginDto.username, loginDto.password);
    }

    @Post('logout')
    async logout() {
        // TODO: Implement logout logic
        return { message: 'Logged out successfully' };
    }

    @Post('refresh')
    async refresh(@Body() body: { refreshToken: string }) {
        // TODO: Implement token refresh
        return { accessToken: 'new_token' };
    }
}
