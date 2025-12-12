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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_custom_1 = require("passport-custom");
const config_1 = require("@nestjs/config");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_custom_1.Strategy, 'jwt') {
    constructor(configService) {
        super();
        this.configService = configService;
        this.bypassAuth = this.configService.get('BYPASS_AUTH') === 'true';
    }
    async validate(req) {
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
            throw new common_1.UnauthorizedException('No token provided');
        }
        const token = authHeader.substring(7);
        try {
            const base64Payload = token.split('.')[1];
            const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
            const roles = payload.realm_access?.roles || [];
            return {
                userId: payload.sub,
                username: payload.preferred_username || payload.username,
                roles: roles,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map