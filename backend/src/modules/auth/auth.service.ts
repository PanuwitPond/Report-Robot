import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
    private readonly keycloakUrl: string;
    private readonly realm: string;
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly bypassAuth: boolean;

    constructor(
        private readonly jwtService: JwtService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.keycloakUrl = this.configService.get<string>('KEYCLOAK_URL');
        this.realm = this.configService.get<string>('KEYCLOAK_REALM');
        this.clientId = this.configService.get<string>('KEYCLOAK_CLIENT_ID');
        this.clientSecret = this.configService.get<string>('KEYCLOAK_CLIENT_SECRET');
        this.bypassAuth = this.configService.get<string>('BYPASS_AUTH') === 'true';
    }

    async login(username: string, password: string) {
        try {
            // 🔄 BYPASS MODE - Return dummy tokens
            if (this.bypassAuth) {
                console.log('🔄 BYPASS MODE ENABLED - Returning dummy tokens for:', username);
                return {
                    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcm5hbWUiOiJhZG1pbiIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJhZG1pbiIsIm1ldHRib3QtdXNlciIsIm1ldHRwb2xlLXVzZXIiXX0sImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
                    refreshToken: 'dummy-refresh-token',
                    expiresIn: 10800,
                    user: {
                        id: `bypass-${username}`,
                        username: username,
                        email: `${username}@test.local`,
                        roles: ['admin', 'mettbot-user', 'mettpole-user'],
                    }
                };
            }

            const tokenUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`;

            console.log('--- Debug Login ---');
            console.log('Token URL:', tokenUrl);
            console.log('Client ID:', this.clientId);
            console.log('Username:', username);
            // Don't log password

            const params = new URLSearchParams();
            params.append('grant_type', 'password');
            params.append('client_id', this.clientId);
            params.append('username', username);
            params.append('password', password);

            if (this.clientSecret) {
                params.append('client_secret', this.clientSecret);
            }

            console.log('Sending request to Keycloak...');
            const { data } = await firstValueFrom(
                this.httpService.post(tokenUrl, params.toString(), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }),
            );
            console.log('Keycloak response received');

            // Decode token to get user info if needed, or just return tokens
            // For now, we return the tokens directly from Keycloak
            // You might want to map roles here if your frontend expects specific structure

            return {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresIn: data.expires_in,
                // You can add user info decoding here if needed
                user: {
                    username: username,
                    // roles: ... (need to decode token to get roles)
                }
            };
        } catch (error) {
            console.error('Keycloak login error:', error.response?.data || error.message);
            throw new UnauthorizedException('Invalid credentials');
        }
    }

    async validateUser(payload: any) {
        return payload;
    }
}
