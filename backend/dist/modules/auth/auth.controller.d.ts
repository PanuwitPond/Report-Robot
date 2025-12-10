import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: {
        username: string;
        password: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            username: string;
            email: string;
            roles: string[];
            domain: string;
        };
    }>;
    logout(): Promise<{
        message: string;
    }>;
    refresh(body: {
        refreshToken: string;
    }): Promise<{
        accessToken: string;
    }>;
}
