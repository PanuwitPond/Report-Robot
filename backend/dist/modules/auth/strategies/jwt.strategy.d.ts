import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private readonly bypassAuth;
    constructor(configService: ConfigService);
    validate(req: Request): Promise<any>;
}
export {};
