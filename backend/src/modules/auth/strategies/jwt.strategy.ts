import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    private readonly bypassAuth: boolean;

    constructor(private configService: ConfigService) {
        super();
        this.bypassAuth = this.configService.get<string>('BYPASS_AUTH') === 'true';
    }

    async validate(req: Request): Promise<any> {
        // 🔄 BYPASS MODE - Skip token validation
        if (this.bypassAuth) {
            console.log('🔄 BYPASS MODE ENABLED - Skipping JWT validation');
            return {
                userId: 'bypass-user-1',
                username: 'admin',
                roles: ['admin', 'mettbot-user', 'mettpole-user'],
            };
        }

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No token provided');
        }

        const token = authHeader.substring(7);

        try {
            // Decode JWT without verification (we trust Keycloak)
            const base64Payload = token.split('.')[1];
            const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());

            // Extract roles from Keycloak token structure
            const roles = payload.realm_access?.roles || [];

            return {
                userId: payload.sub,
                username: payload.preferred_username || payload.username,
                roles: roles,
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
