"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let AuthService = class AuthService {
    constructor(jwtService, httpService, configService) {
        this.jwtService = jwtService;
        this.httpService = httpService;
        this.configService = configService;
        this.keycloakUrl = this.configService.get('KEYCLOAK_URL');
        this.realm = this.configService.get('KEYCLOAK_REALM');
        this.clientId = this.configService.get('KEYCLOAK_CLIENT_ID');
        this.clientSecret = this.configService.get('KEYCLOAK_CLIENT_SECRET');
        this.bypassAuth = this.configService.get('BYPASS_AUTH') === 'true';
    }
    async login(username, password) {
        try {
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
            const params = new URLSearchParams();
            params.append('grant_type', 'password');
            params.append('client_id', this.clientId);
            params.append('username', username);
            params.append('password', password);
            if (this.clientSecret) {
                params.append('client_secret', this.clientSecret);
            }
            console.log('Sending request to Keycloak...');
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.post(tokenUrl, params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }));
            console.log('Keycloak response received');
            return {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresIn: data.expires_in,
                user: {
                    username: username,
                }
            };
        }
        catch (error) {
            console.error('Keycloak login error:', error.response?.data || error.message);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
    }
    async validateUser(payload) {
        return payload;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        axios_1.HttpService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map