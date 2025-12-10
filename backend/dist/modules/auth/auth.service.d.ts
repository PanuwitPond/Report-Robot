import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private jwtService;
    constructor(jwtService: JwtService);
    login(username: string, password: string): Promise<{
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
    validateUser(payload: any): Promise<any>;
}
