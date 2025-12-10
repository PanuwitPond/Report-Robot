import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) { }

    async login(username: string, password: string) {
        // TODO: Integrate with Keycloak
        // For now, this is a placeholder

        // Mock user data
        const user = {
            id: '1',
            username,
            email: `${username}@example.com`,
            roles: username === 'admin' ? ['ADMIN'] : ['METTBOT_USER'],
            domain: username === 'admin' ? null : 'METTBOT',
        };

        const payload = { sub: user.id, username: user.username, roles: user.roles };

        return {
            accessToken: this.jwtService.sign(payload),
            refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
            user,
        };
    }

    async validateUser(payload: any) {
        // TODO: Validate with Keycloak
        return payload;
    }
}
