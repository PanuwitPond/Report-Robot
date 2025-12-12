import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private readonly jwtService;
    private readonly httpService;
    private readonly configService;
    private readonly keycloakUrl;
    private readonly realm;
    private readonly clientId;
    private readonly clientSecret;
    private readonly bypassAuth;
    constructor(jwtService: JwtService, httpService: HttpService, configService: ConfigService);
    login(username: string, password: string): Promise<{
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
    validateUser(payload: any): Promise<any>;
}
