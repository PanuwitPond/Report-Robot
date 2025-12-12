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
        expiresIn: number;
        user: {
            id: string;
            username: string;
            email: string;
            roles: string[];
        };
    } | {
        accessToken: any;
        refreshToken: any;
        expiresIn: any;
        user: {
            username: string;
            id?: undefined;
            email?: undefined;
            roles?: undefined;
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
