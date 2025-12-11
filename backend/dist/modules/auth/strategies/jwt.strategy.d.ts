import { Strategy } from 'passport-custom';
import { Request } from 'express';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    validate(req: Request): Promise<any>;
}
export {};
